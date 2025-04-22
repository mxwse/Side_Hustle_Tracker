import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function CreateTeam({ onTeamCreated }) {
  const [teamName, setTeamName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleCreate = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const user = (await supabase.auth.getUser()).data.user

    // Team anlegen
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        created_by: user.id,
      })
      .select()
      .single()

    if (teamError) {
      setError(teamError.message)
      setLoading(false)
      return
    }

    // User als Admin eintragen
    const { error: memberError } = await supabase.from("team_members").insert({
      user_id: user.id,
      team_id: team.id,
      role: "Admin",
      email: user.email,
    })

    if (memberError) {
      setError(memberError.message)
    } else {
      setSuccess("Team erfolgreich erstellt ✅")
      setTeamName("")
      onTeamCreated?.(team) // Callback z.B. zum Neuladen der Liste
    }

    setLoading(false)
  }

  return (
    <form
      onSubmit={handleCreate}
      className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-xl w-full space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Team erstellen</h2>

      <input
        type="text"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Teamname (z. B. Marketing, Dev-Team...)"
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
      >
        {loading ? "Erstelle..." : "Team erstellen"}
      </button>
    </form>
  )
}
