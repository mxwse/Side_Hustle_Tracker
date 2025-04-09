import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function ProjectChat({ projectId }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, users:profiles(username)") // Optional: Username aus Profile-Table
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    if (data) setMessages(data)
  }

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel("chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    const user = (await supabase.auth.getUser()).data.user

    await supabase.from("messages").insert({
      user_id: user.id,
      project_id: projectId,
      message: newMessage,
    })

    setNewMessage("")
  }

  return (
    <div className="hidden md:fixed md:top-20 md:right-0 md:w-80 md:h-[calc(100vh-5rem)] md:block bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 rounded-tr-lg rounded-br-lg shadow z-40 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">📢 Projekt-Chat</h2>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
            <div className="font-medium text-blue-600 dark:text-blue-300">{msg.user_id}</div>
            <div className="text-gray-800 dark:text-gray-100">{msg.message}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(msg.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Nachricht schreiben..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Senden
        </button>
      </div>
    </div>
  )
}
