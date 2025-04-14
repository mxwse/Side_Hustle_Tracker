import { useState } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"


export default function TransactionList({ amount }) {
    const [refreshKey] = useState(0)
    const [entries, setEntries] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAllEntries = async () => {

        const { data, error } = await supabase
            .from("entries")
            .select("*, projects(name)")
            .order("date", { ascending: false })

        if (!error) {
            setEntries(data)
        }
        }

        fetchAllEntries()
    }, [refreshKey])

    return (
    <table className="w-full table-auto border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm tracking-wider">
          <tr>
            <th className="p-2 text-left">Datum</th>
            <th className="p-2 text-left">Typ</th>
            <th className="p-2 text-left">Betrag</th>
            <th className="p-2 text-left">Beschreibung</th>
            <th className="p-2 text-left">Projekt</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, amount).map((entry) => (
            <tr key={entry.id} onClick={() => navigate(`/project/${entry.project_id}`)} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="p-2">{entry.date}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    entry.type === "income" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {entry.type === "income" ? "Einnahme" : "Ausgabe"}
                </span>
              </td>
              <td className="p-2">{entry.amount.toFixed(2)} €</td>
              <td className="p-2">{entry.description || "–"}</td>
              <td className="p-2">{entry.projects?.name || "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
}