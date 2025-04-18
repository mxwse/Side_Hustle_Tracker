import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
  } from 'recharts'

  export default function ProfitChart() {
        // Gruppiere Einträge nach Datum & berechne Gewinn pro Tag
        const { id } = useParams()
        const profitByDate = {}
        const [entries, setEntries] = useState([])
        const [setProject] = useState(null)
        const [refresh] = useState(0)

        entries.forEach((entry) => {
            const date = entry.date
            if (!profitByDate[date]) profitByDate[date] = 0
            profitByDate[date] += entry.type === "income" ? entry.amount : -entry.amount
        })

        // In Array umwandeln für Recharts
        const profitChartData = Object.entries(profitByDate).map(([date, value]) => ({
            date,
            profit: Number(value.toFixed(2)),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));


        useEffect(() => {
            const fetchProject = async () => {
              const { data } = await supabase.from("projects").select("*").eq("id", id).single()
              setProject(data)
            }
            fetchProject()
          }, [id])

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
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
            <h2 className="text-lg font-semibold mb-4">📈 Gewinnentwicklung</h2>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={profitChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                    contentStyle={{ backgroundColor: "#2d3748", border: "none", color: "white" }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value) => [`${value} €`, "Gewinn"]}
                />
                <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#4ade80"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                />
                </LineChart>
                </ResponsiveContainer>
        </div>
    )
}