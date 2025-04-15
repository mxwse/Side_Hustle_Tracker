import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ChatsList() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("team_members")
        .select("team_id, teams(id, name, chats(id, name, created_by))")
        .eq("user_id", user.id);

      if (!error) {
        const allChats = data
          .flatMap((member) => member.teams?.chats || [])
          .filter((chat, index, self) => index === self.findIndex(c => c.id === chat.id)); // duplikate entfernen

        setChats(allChats);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chats/${chat.id}`)}
          className="cursor-pointer p-4 bg-white dark:bg-gray-800 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <h2 className="text-lg font-semibold">{chat.name} + {chat.teams?.name}</h2>
        </div>
      ))}

      {chats.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Keine Chats gefunden.</p>
      )}
    </div>
  );
}
