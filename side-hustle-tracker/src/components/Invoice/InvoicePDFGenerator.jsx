import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";
import { supabase } from "../../lib/supabaseClient";


export async function generatePDF(data) {
    const user = (await supabase.auth.getUser()).data.user;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    let y = height - 60;
  
    const drawText = (text, x = 50, size = 12) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 18;
    };
  
    // [draw invoice content as before...]
  
    const net = data.items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const taxAmount = (net * data.tax) / 100;
    const total = net + taxAmount + data.shipping;
  
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
      invoice_number: data.invoice.number,
      file_url: fileUrl,
      user_id: user.id,
      entries: data.items,
      total,
    });
  
    if (insertError) {
      console.error("❌ Fehler beim Speichern in DB:", insertError.message);
      return;
    }
  
    // 💾 Optional lokal speichern
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, filename);
  }