import { supabase } from "../../lib/supabaseClient";

export default async function getNextInvoiceNumber() {
    const currentYear = new Date().getFullYear();
  
    const { data, error } = await supabase
      .from("invoices")
      .select("invoice_number")
      .ilike("invoice_number", `RE-${currentYear}-%`);
  
    if (error) {
      console.error("❌ Fehler beim Abrufen bestehender Rechnungen:", error.message);
      return null;
    }
  
    // Extrahiere letzte laufende Nummer
    const numbers = data
      .map((inv) => {
        const match = inv.invoice_number?.match(/RE-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
  
    const nextNumber = (Math.max(...numbers, 0) + 1)
      .toString()
      .padStart(4, "0");
  
    return `RE-${currentYear}-${nextNumber}`;
  }