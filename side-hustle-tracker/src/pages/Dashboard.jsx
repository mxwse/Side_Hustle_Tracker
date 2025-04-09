import { useState } from "react"
import AddProject from "../components/AddProject"
import ProjectList from "../components/ProjectList"
import ThemeToggle from "../components/ThemeToggle"
import { useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleProjectAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const [entries, setEntries] = useState([])

  useEffect(() => {
    const fetchAllEntries = async () => {
      const user = (await supabase.auth.getUser()).data.user

      const { data, error } = await supabase
        .from("entries")
        .select("*, projects(name)")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (!error) {
        setEntries(data)
      }
    }

    fetchAllEntries()
  }, [refreshKey])

  const incomeTotal = entries
  .filter((e) => e.type === "income")
  .reduce((sum, e) => sum + e.amount, 0)

  const expenseTotal = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)

  const profitTotal = incomeTotal - expenseTotal

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <ThemeToggle />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded shadow text-center">
            <p className="text-green-800 dark:text-green-200 font-bold text-xl">{incomeTotal.toFixed(2)} €</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Einnahmen gesamt</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded shadow text-center">
            <p className="text-red-800 dark:text-red-200 font-bold text-xl">{expenseTotal.toFixed(2)} €</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Ausgaben gesamt</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded shadow text-center">
            <p className="text-blue-800 dark:text-blue-200 font-bold text-xl">{profitTotal.toFixed(2)} €</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Gewinn gesamt</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Letzte 5 Buchungen</h2>
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
              {entries.slice(0, 5).map((entry) => (
                <tr key={entry.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            📋 Projektübersicht
          </h2>
          <ProjectList refresh={refreshKey} />
        </div>
        <AddProject onProjectAdded={handleProjectAdded} />

      </div>
    </div>
  )
}
