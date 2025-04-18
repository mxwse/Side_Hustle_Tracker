import {useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export default function IncomeOverview() {
    
    const [entries, setEntries] = useState([])
    const { id } = useParams()
    const [refresh] = useState(0)

    useEffect(() => {
        const fetchEntries = async () => {
          const { data } = await supabase
            .from("entries")
            .select("*, projects(name), profiles(username, email, avatar_url)")
            .eq("project_id", id)
            .order("created_at", { ascending: false })
    
          setEntries(data)
        }
        fetchEntries()
      }, [id, refresh])

    const income = entries
        .filter((e) => e.type === "income")
        .reduce((sum, e) => sum + e.amount, 0)

    const expense = entries
        .filter((e) => e.type === "expense")
        .reduce((sum, e) => sum + e.amount, 0)

    const profit = income - expense

    return(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded shadow text-center">
                <p className="text-green-800 dark:text-green-200 font-bold text-xl">{income.toFixed(2)} €</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Einnahmen</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded shadow text-center">
                <p className="text-red-800 dark:text-red-200 font-bold text-xl">{expense.toFixed(2)} €</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Ausgaben</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded shadow text-center">
                <p className="text-blue-800 dark:text-blue-200 font-bold text-xl">{profit.toFixed(2)} €</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Gewinn</p>
            </div>
        </div>
    )
}