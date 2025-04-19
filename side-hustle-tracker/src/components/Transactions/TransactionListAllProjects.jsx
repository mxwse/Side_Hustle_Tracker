import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function TransactionListAllProjects({ limit = 5, scrollable = true}) {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*, projects(name), profiles(username, email)")
        .order("created_at", { ascending: false })
        .limit(100); // maximale Datenmenge aus Supabase
      if (!error) {
        setEntries(data || []);
      }
    };
    fetchEntries();
  }, []);

  return (
    <div className="overflow-y-auto w-full">
      <div className={`w-full ${scrollable && entries.length > limit ? "overflow-y-auto max-h-64" : ""}`}>
        <table className="min-w-full table-auto bg-white dark:bg-gray-800 text-sm">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
            <tr>
              <th className="p-2 text-left">Datum</th>
              <th className="p-2 text-left">Typ</th>
              <th className="p-2 text-left">Betrag</th>
              <th className="p-2 text-left">Beschreibung</th>
              <th className="p-2 text-left">Projekt</th>
              <th className="p-2 text-left">Ersteller</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => navigate(`/project/${entry.project_id}`)}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-2">
                  {new Date(entry.date).toLocaleDateString("de-DE")}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      entry.type === "income"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {entry.type === "income" ? "Einnahme" : "Ausgabe"}
                  </span>
                </td>
                <td className="p-2">{entry.amount.toFixed(2)} €</td>
                <td className="p-2">{entry.description || "–"}</td>
                <td className="p-2">{entry.projects?.name || "–"}</td>
                <td className="p-2">{entry.profiles?.username || entry.profiles?.email || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
