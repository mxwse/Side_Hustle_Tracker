import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"

export default function TeamDetail() {
  const { id: teamId } = useParams()
  const [members, setMembers] = useState([])
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchMembers = async () => {
    setLoading(true)
    setError("")

    const user = (await supabase.auth.getUser()).data.user
    console.log("Aktueller User:", user)

    const { data: allMembers, error: memberError } = await supabase
      .from("team_members")
      .select("user_id, role, joined_at, email")
      .eq("team_id", teamId)

    if (memberError) {
      console.error("Fehler beim Laden der Teammitglieder:", memberError)
      setError("Teammitglieder konnten nicht geladen werden.")
      setLoading(false)
      return
    }

    if (Array.isArray(allMembers)) {
      const ownEntry = allMembers.find((m) => m.user_id === user.id)
      if (ownEntry) setRole(ownEntry.role)
      else {
        console.warn("Benutzer ist nicht Mitglied dieses Teams.")
        setRole("")
      }

      setMembers(allMembers)
    }

    setLoading(false)
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setError("")

    // Nutzer über E-Mail finden
    const { data: profile, error: fetchError } = await supabase
        .from("profiles") // oder deine user-Tabelle
        .select("id, email")
        .eq("email", email)
        .single()

    if (fetchError || !profile) {
      setError("Benutzer nicht gefunden.")
      return
    }

    // Mitglied einfügen
    const { error: insertError } = await supabase.from("team_members").insert({
      team_id: teamId,
      user_id: profile.id,
      role: "Intern",
      email: profile.email,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setEmail("")
      fetchMembers()
    }
  }

  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">👥 Team-Mitglieder</h1>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <p>Lade Mitglieder...</p>
      ) : (
        <ul className="space-y-4">
          {members.map((m) => (
            <li
              key={m.user_id}
              className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between items-center"
            >
              <div>
              <p className="font-semibold">{m.email || m.user_id}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Rolle: {m.role}
                </p>
              </div>
              <div className="text-sm text-gray-400">
                seit {new Date(m.joined_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {["Admin", "Manager"].includes(role) && (
        <form onSubmit={handleInvite} className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">➕ Mitglied einladen</h2>
          <input
            type="email"
            placeholder="E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Mitglied hinzufügen
          </button>
        </form>
      )}
    </div>
  )
}
