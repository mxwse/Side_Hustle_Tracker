import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export default function ProjectList({ refresh }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchProjects = async () => {
    setLoading(true)
    const user = (await supabase.auth.getUser()).data.user

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fehler beim Laden der Projekte:", error)
    } else {
      setProjects(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [refresh])

  if (loading) return <p className="mt-4">⏳ Lade Projekte...</p>
  if (projects.length === 0) return <p className="mt-4 text-gray-600 dark:text-gray-400">Noch keine Projekte vorhanden.</p>

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow rounded">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm tracking-wider">
          <tr>
            <th className="text-left p-3">🗂️ Projektname</th>
            <th className="text-left p-3">📝 Beschreibung</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">{project.name}</td>
              <td className="p-3 text-gray-600 dark:text-gray-300">{project.description || "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
