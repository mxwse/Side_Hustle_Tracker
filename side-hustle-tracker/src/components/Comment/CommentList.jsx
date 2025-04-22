import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function CommentList({ projectId, refreshKey }) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(username, email)")
        .eq("project_id", projectId)
        .order("timestamp", { ascending: false })

      if (!error) {
        setComments(data)
      }
    }

    fetchComments()
  }, [projectId, refreshKey])

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Kommentare</h2>
      {comments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm">Keine Kommentare vorhanden.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line">{c.comment}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {c.profiles?.username || c.profiles?.email || "Unbekannt"} · {new Date(c.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}