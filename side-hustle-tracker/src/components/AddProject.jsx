import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function AddProject({ onProjectAdded }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const user = (await supabase.auth.getUser()).data.user

    const { error } = await supabase.from("projects").insert({
      name,
      description,
      user_id: user.id,
    })

    if (error) {
      console.error(error)
      setError(error.message)
    } else {
      setName("")
      setDescription("")
      if (onProjectAdded) onProjectAdded() // callback bei Erfolg
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full max-w-md space-y-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">➕ Neues Projekt anlegen</h2>
      <input
        type="text"
        placeholder="Projektname"
        className="w-full mb-2 p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Beschreibung (optional)"
        className="w-full mb-2 p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Speichere..." : "Projekt erstellen"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}
