import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function RecentComments() {
  const [comments, setComments] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchComments = async () => {

      const { data, error } = await supabase
        .from("comments")
        .select("*, projects(name), profiles(username, email)")
        .order("timestamp", { ascending: false })
        .limit(10)

      if (!error) {
        setComments(data)
      } else {
        console.error("Fehler beim Laden der Kommentare:", error)
      }
    }

    fetchComments()
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow max-h-90 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Letzte Kommentare</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">Keine Kommentare vorhanden.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex justify-between">
                <span
                  className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                  onClick={() => navigate(`/project/${c.project_id}`)}
                >
                  {c.projects?.name || "Projekt"}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {new Date(c.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{c.comment}</p>
                <span className="text-gray-500 dark:text-gray-400 text-xs"> von {c.profiles?.username || c.profiles?.email || "Unbekannt"}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
