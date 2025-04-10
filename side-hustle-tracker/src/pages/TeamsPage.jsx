import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"
import CreateTeam from "../components/CreateTeam"
import ThemeToggle from "../components/ThemeToggle"

export default function TeamsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const fetchTeams = async () => {
    const user = (await supabase.auth.getUser()).data.user

    const { data, error } = await supabase
      .from("team_members")
      .select("role, joined_at, teams(id, name)")
      .eq("user_id", user.id)

    if (!error) {
      setTeams(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <ThemeToggle />
      <h1 className="text-2xl font-bold mb-6">👥 Meine Teams</h1>

      <CreateTeam onTeamCreated={fetchTeams} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Aktive Teams</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Lade Teams...</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-gray-500">Du bist noch in keinem Team.</p>
        ) : (
          <ul className="space-y-4">
            {teams.map((entry) => (
              <li
                key={entry.teams.id}
                onClick={() => navigate(`/teams/${entry.teams.id}`)}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">{entry.teams.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rolle: {entry.role} · Beigetreten:{" "}
                    {new Date(entry.joined_at).toLocaleDateString()}
                  </p>
                </div>
                {/* Hier kannst du später z.B. einen "Öffnen"-Button einbauen */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
