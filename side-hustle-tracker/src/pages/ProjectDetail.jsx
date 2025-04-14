import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import ThemeToggle from "../components/ThemeToggle"
import AddComment from "../components/AddComment"
import CommentList from "../components/CommentList"
import TransactionList from "../components/TransactionList"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [entries, setEntries] = useState([])
  const [type, setType] = useState("income")
  const [amount, setAmount] = useState("")
  const [desc, setDesc] = useState("")
  const [refresh, setRefresh] = useState(0)

  // Gruppiere Einträge nach Datum & berechne Gewinn pro Tag
  const profitByDate = {}

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

  const handleAddEntry = async (e) => {
    e.preventDefault()
    const user = (await supabase.auth.getUser()).data.user
    const { error } = await supabase.from("entries").insert({
      user_id: user.id,
      project_id: id,
      type,
      amount: parseFloat(amount),
      description: desc,
      date: new Date().toISOString().split("T")[0],
      creator: user.email,
    })

    if (!error) {
      setAmount("")
      setDesc("")
      setRefresh((prev) => prev + 1)
    }
  }
  const [commentsRefreshKey, setCommentsRefreshKey] = useState(0)

  const handleCommentAdded = () => {
    setCommentsRefreshKey((prev) => prev + 1)
  }
  const income = entries.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0)
  const expense = entries.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0)
  const profit = income - expense

  if (!project) return <p className="p-6 text-gray-800 dark:text-gray-200">⏳ Lade Projekt...</p>

  


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <ThemeToggle />
      <div className="p-6 max-w-4xl mx-auto text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">{project.description}</p>

        {/* Formular */}
        <form onSubmit={handleAddEntry} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 space-y-4">
          <h2 className="text-lg font-semibold">➕ Neue Buchung</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="income">Einnahme</option>
              <option value="expense">Ausgabe</option>
            </select>
            <input
              type="number"
              placeholder="Betrag (€)"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Beschreibung"
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
            >
              Hinzufügen
            </button>
          </div>
        </form>

        {/* Übersicht */}
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <TransactionList limit={5} scrollable={true} />
        </div>
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
        <AddComment projectId={project.id} onCommentAdded={handleCommentAdded} />
        <CommentList projectId={project.id} refreshKey={commentsRefreshKey} />
      </div>
    </div>
  )
}
