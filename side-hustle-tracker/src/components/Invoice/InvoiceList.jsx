import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("invoices")
        .select("*, projects(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setInvoices(data);
      }

      setLoading(false);
    };

    fetchInvoices();
  }, []);

  if (loading) return <p className="p-4 text-gray-500">⏳ Lade Rechnungen...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meine Rechnungen</h2>

      {invoices.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Noch keine Rechnungen vorhanden.</p>
      )}

      {invoices.length > 0 && (
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
            <tr>
              <th className="text-left p-2">Projekt</th>
              <th className="text-left p-2"># Nummer</th>
              <th className="text-left p-2">Betrag</th>
              <th className="text-left p-2">Datum</th>
              <th className="text-left p-2">⬇️</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{inv.projects?.name || "–"}</td>
                <td className="p-2">{inv.invoice_number || "–"}</td>
                <td className="p-2">{inv.total.toFixed(2)} €</td>
                <td className="p-2">
                  {new Date(inv.created_at).toLocaleDateString("de-DE")}
                </td>
                <td className="p-2">
                  {inv.file_url ? (
                    <a
                      href={inv.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Herunterladen
                    </a>
                  ) : (
                    "–"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
