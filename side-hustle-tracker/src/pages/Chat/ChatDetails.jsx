import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import ThemeToggle from "../../components/Visuals/ThemeToggle"

export default function ChatDetail() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);
  const [chatName, setChatName] = useState("");

  // Nutzer laden
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchChatName = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("name")
        .eq("id", parseInt(chatId))
        .single();
  
      if (!error) {
        setChatName(data.name);
      } else {
        console.error("Fehler beim Laden des Chatnamens:", error);
      }
    };
  
    fetchChatName();
  }, [chatId]);
  
  // Nachrichten laden + Live-Updates
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles:fk_user_profile(username)")
        .eq("chat_id", parseInt(chatId))
        .order("created_at", { ascending: true });

      if (!error) {
        setMessages(data);
      } else {
        console.error("Fehler beim Laden:", error);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel("chat-messages-" + chatId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Scrollen bei neuen Nachrichten
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Nachricht senden
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    const { error } = await supabase.from("messages").insert({
      chat_id: parseInt(chatId),
      user_id: user.id,
      content: messageInput.trim(),
    });

    if (!error) setMessageInput("");
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-6 min-h-screen">
      <ThemeToggle />
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        💬 {chatName || "Chat"}
      </h2>

      <div
        className="bg-gray-50 dark:bg-gray-800 rounded p-4 space-y-4 overflow-y-auto"
        style={{ height: "80vh" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[75%] p-3 rounded shadow ${
              msg.user_id === user?.id
                ? "bg-blue-600 text-white ml-auto"
                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            }`}
          >
            <p className="text-sm">{msg.content}</p>
            <p className="text-xs text-gray-300 mt-1">
              {msg.profiles?.username || msg.user_id.slice(0, 6)} ·{" "}
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Nachricht schreiben..."
          className="flex-grow p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Senden
        </button>
      </form>
    </div>
  );
}
