import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

export async function generatePDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();

  let y = height - 50;

  const drawText = (text, options = {}) => {
    page.drawText(text, {
      x: options.x || 50,
      y: options.y || y,
      size: options.size || 12,
      font,
      color: options.color || rgb(0, 0, 0),
    });
    y = options.y !== undefined ? options.y : y - (options.spacing || 18);
  };

  // 🔷 Header
  drawText("RECHNUNG", { size: 20 });

  // 🔹 Absender
  y -= 20;
  drawText(data.from.name, { size: 12 });
  drawText(data.from.address);
  drawText(`Tel: ${data.from.phone}`);
  if (data.from.fax) drawText(`Fax: ${data.from.fax}`);

  // 🔹 Empfänger
  y -= 30;
  drawText("Empfänger:", { size: 12 });
  drawText(data.to.name);
  if (data.to.company) drawText(data.to.company);
  drawText(data.to.address);
  if (data.to.phone) drawText(`Tel: ${data.to.phone}`);

  // 🔹 Rechnungskopf
  y -= 30;
  drawText(`Rechnungsnummer: ${data.invoice.number}`);
  drawText(`Datum: ${data.invoice.date}`);
  if (data.invoice.comment) {
    y -= 10;
    drawText(`Hinweis: ${data.invoice.comment}`);
  }

  // 🧾 Positionen
  y -= 30;
  drawText("Leistungen:", { size: 12 });

  data.items.forEach((item) => {
    const sum = item.qty * item.price;
    drawText(
      `${item.qty} x ${item.description} à ${item.price.toFixed(2)} € = ${sum.toFixed(2)} €`
    );
  });

  // 💶 Gesamtsumme
  y -= 20;
  const net = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxAmount = (net * data.tax) / 100;
  const total = net + taxAmount + data.shipping;

  drawText(`Zwischensumme: ${net.toFixed(2)} €`);
  drawText(`MwSt. (${data.tax}%): ${taxAmount.toFixed(2)} €`);
  drawText(`Versand: ${data.shipping.toFixed(2)} €`);
  y -= 10;
  drawText(`Gesamtbetrag: ${total.toFixed(2)} €`, { size: 14 });

  // 🧾 Speichern & Herunterladen
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, `Rechnung_${data.invoice.number || "unbenannt"}.pdf`);
}
