import { useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function AddComment({ projectId, onCommentAdded }) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const user = (await supabase.auth.getUser()).data.user
    const creator = user.email // oder user.id

    const { error } = await supabase.from("comments").insert({
      project_id: projectId,
      creator,
      comment,
      timestamp: new Date().toISOString(),
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setComment("")
      onCommentAdded?.() // optionaler Callback zum Neuladen
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-3 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">💬 Kommentar hinzufügen</h2>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        rows={3}
        placeholder="Was möchtest du festhalten?"
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
      >
        {loading ? "Speichern..." : "Kommentar speichern"}
      </button>
    </form>
  )
}
