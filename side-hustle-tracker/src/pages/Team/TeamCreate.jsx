import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"

import CreateTeam from "../../components/AddTableRow/CreateTeam"
import ThemeToggle from "../../components/Visuals/ThemeToggle"

export default function TeamCreate() {
  const [setTeams] = useState([])
  const [setLoading] = useState(true)
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
      <h1 className="text-2xl font-bold mb-6">Meine Teams</h1>

      <CreateTeam onTeamCreated={fetchTeams} />
    </div>
    )
}