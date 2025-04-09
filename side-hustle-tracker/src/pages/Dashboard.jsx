import { useState } from "react"
import AddProject from "../components/AddProject"
import ProjectList from "../components/ProjectList"
import ThemeToggle from "../components/ThemeToggle"
import { useEffect } from "react"
import RecentComments from "../components/RecentComments"
import { supabase } from "../lib/supabaseClient"
import TransactionList from "../components/TransactionList"

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
          <TransactionList amount={5} />
        </div>
          <div className="grid md:grid-cols-2 gap-4">
          <RecentComments />
          <AddProject onProjectAdded={handleProjectAdded} />
        </div>
        <ProjectList refresh={refreshKey} />
      </div>
    </div>
  )
}
