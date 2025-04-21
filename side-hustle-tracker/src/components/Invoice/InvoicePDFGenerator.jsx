import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { supabase } from "../../lib/supabaseClient";

import getNextInvoiceNumber from "./GenerateInvoiceNumber";

export async function generatePDF(data) {
  console.log("📤 Empfangenes Datenpaket:", data);
  const user = (await supabase.auth.getUser()).data.user;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();
  const net = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const taxAmount = (net * data.tax) / 100;
  const total = net + taxAmount + data.shipping;
  const rightMargin = 50;
  const rightYStart = height - 60;
  let rightY = rightYStart;
  let y = height - 60;
  const invoiceNumber = await getNextInvoiceNumber();
  
  const drawText = (text, x = 50, yOverride = null, size = 12) => {
    page.drawText(text, {
      x,
      y: yOverride !== null ? yOverride : y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    if (yOverride === null) y -= size + 4;
  };

  // 🎯 Header
  page.drawText("RECHNUNG", {
    x: width / 2 - font.widthOfTextAtSize("RECHNUNG", 18) / 2,
    y,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // 🧾 Absender (links oben)
  drawText(data.from.name, 50);
  drawText(data.from.address);
  drawText(`Tel: ${data.from.phone}`);
  if (data.from.fax) drawText(`Fax: ${data.from.fax}`);

  // 👤 Empfänger (rechts oben)
  const drawRightAligned = (text, yValue, size = 10) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = width - rightMargin - textWidth;
    page.drawText(text, { x, y: yValue, size, font });
  };
  
  drawRightAligned("Empfänger:", rightY, 12);
  rightY -= 16;
  
  drawRightAligned(data.to.name, rightY);
  rightY -= 14;
  
  if (data.to.company) {
    drawRightAligned(data.to.company, rightY);
    rightY -= 14;
  }
  
  drawRightAligned(data.to.address, rightY);
  rightY -= 14;
  
  if (data.to.phone) {
    drawRightAligned(`Tel: ${data.to.phone}`, rightY);
    rightY -= 14;
  }
  y -= 20;

  // 📄 Rechnungsdaten
  drawText(`Rechnungsnummer: ${invoiceNumber}`);
  drawText(`Datum: ${data.invoice.date}`);
  if (data.invoice.comment) drawText(`Hinweis: ${data.invoice.comment}`);

  y -= 20;

  // 🧾 Positionsüberschrift
  const colX = [50, 90, 320, 460]; // Menge, Bezeichnung, Einzelpreis, Gesamt
  page.drawText("Menge", { x: colX[0], y, size: 10, font });
  page.drawText("Beschreibung", { x: colX[1], y, size: 10, font });
  page.drawText("Einzelpreis", { x: colX[2], y, size: 10, font });
  page.drawText("Gesamt", { x: colX[3], y, size: 10, font });
  y -= 10;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: rgb(0.75, 0.75, 0.75),
  });
  y -= 14;

  // 📦 Positionen
  data.items.forEach((item) => {
    const lineTotal = item.qty * item.price;
    page.drawText(`${item.qty}`, { x: colX[0], y, size: 10, font });
    page.drawText(item.description, { x: colX[1], y, size: 10, font });
    page.drawText(`${item.price.toFixed(2)} €`, { x: colX[2], y, size: 10, font });
    page.drawText(`${lineTotal.toFixed(2)} €`, { x: colX[3], y, size: 10, font });
    y -= 16;
  });

  y -= 10;

  const drawTotalLine = (label, amount) => {
    page.drawText(label, { x: colX[2], y, size: 10, font });
    page.drawText(`${amount.toFixed(2)} €`, { x: colX[3], y, size: 10, font });
    y -= 14;
  };

  drawTotalLine("Zwischensumme", net);
  drawTotalLine(`MwSt. (${data.tax}%)`, taxAmount);
  drawTotalLine("Versand", data.shipping);

  y -= 6;

  // 🟩 Gesamtbetrag hervorheben
  page.drawRectangle({
    x: colX[2],
    y: y - 4,
    width: 130,
    height: 18,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText("Gesamtbetrag", {
    x: colX[2] + 5,
    y,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText(`${total.toFixed(2)} €`, {
    x: colX[3],
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });

  // [draw invoice content as before...]

  drawText(`Gesamtbetrag: ${total.toFixed(2)} €`, 50, 14);

  // 🧾 PDF speichern
  const pdfBytes = await pdfDoc.save();
  const filename = `invoice_${data.invoice.number || Date.now()}.pdf`;

  // 📁 In Supabase hochladen
  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(filename, pdfBytes, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("❌ Fehler beim Upload:", uploadError.message);
    return;
  }

  // 🔗 Download-URL erzeugen
  const { data: fileData } = supabase.storage
    .from("invoices")
    .getPublicUrl(filename);

    const fileUrl = fileData?.publicUrl;

  // 📄 Eintrag in Rechnungstabelle
  const { error: insertError } = await supabase.from("invoices").insert({
    invoice_number: invoiceNumber,
    file_url: fileUrl,
    user_id: user.id,
    entries: data.items,
    total : total,
    project_id: data.project_id,
  });

  if (insertError) {
    console.error("❌ Fehler beim Speichern in DB:", insertError.message);
    return;
  }

  // 💾 Optional lokal speichern
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, filename);
}