import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { supabase } from "../../lib/supabaseClient";

export default function InvoiceGenerator({ projectId }) {
  const generateInvoice = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    // Benutzerprofil laden
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, email")
      .eq("id", user.id)
      .single();

    // Projektdaten laden
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    // Einnahmen-Einträge laden
    const { data: entries } = await supabase
      .from("entries")
      .select("*")
      .eq("project_id", projectId)
      .eq("type", "income");

    const total = entries.reduce((sum, e) => sum + e.amount, 0);

    // PDF generieren
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    let y = height - 50;

    page.drawText("RECHNUNG", {
      x: 50,
      y,
      size: 24,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    y -= 40;
    page.drawText(`Projekt: ${project.name}`, { x: 50, y, size: 12, font });
    y -= 20;
    page.drawText(`Erstellt durch: ${profile.username} (${profile.email})`, {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 30;
    page.drawText("Leistungen:", { x: 50, y, size: 12, font });
    y -= 20;

    entries.forEach((entry) => {
      page.drawText(`- ${entry.date}: ${entry.description} – ${entry.amount.toFixed(2)} €`, {
        x: 60,
        y,
        size: 10,
        font,
      });
      y -= 16;
    });

    y -= 20;
    page.drawText(`Gesamt: ${total.toFixed(2)} €`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    const pdfBytes = await pdfDoc.save();

    // PDF im Supabase Storage speichern
    const filename = `invoice_${project.name}_${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filename, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Fehler beim Speichern im Storage:", uploadError);
      return;
    }

    // Download-Link generieren
    const { data: fileData } = supabase.storage
      .from("invoices")
      .getPublicUrl(filename);

    const fileUrl = fileData?.publicUrl;

    // Rechnung speichern
    const { error: insertError } = await supabase.from("invoices").insert({
      user_id: user.id,
      project_id: projectId,
      invoice_number: `RE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      total,
      entries,
      file_url: fileUrl,
    });

    if (insertError) {
      console.error("Fehler beim Speichern der Rechnung:", insertError);
      return;
    }

    // Optional: lokal herunterladen
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, `Rechnung_${project.name}.pdf`);
  };

  return (
    <button
      onClick={generateInvoice}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
    >
      📄 Rechnung erstellen
    </button>
  );
}
