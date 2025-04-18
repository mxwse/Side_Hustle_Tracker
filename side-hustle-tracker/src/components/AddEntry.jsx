import { useParams } from "react-router-dom"
import {useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function AddComment() {
    const [amount, setAmount] = useState("")
    const [desc, setDesc] = useState("")
    const [setRefresh] = useState(0)
    const { id } = useParams()
    const [type, setType] = useState("income")

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

  return (
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
  )
}
