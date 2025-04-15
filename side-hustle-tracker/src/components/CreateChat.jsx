import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CreateChat({ onCreated }) {
  const [chatName, setChatName] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("team_members")
        .select("team_id, teams(id, name)")
        .eq("user_id", user.id);

      if (!error) {
        const uniqueTeams = data.map((d) => d.teams);
        setTeams(uniqueTeams);
      }
    };

    fetchTeams();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Chat erstellen
    const { data: chatData, error: insertError } = await supabase
      .from("chats")
      .insert({
        name: chatName,
        team_id: selectedTeamId || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError("Fehler beim Erstellen: " + insertError.message);
      setLoading(false);
      return;
    }

    // Ersteller in chat_members eintragen
    const { error: memberError } = await supabase.from("chat_members").insert({
        chat_id: chatData.id,
        user_id: user.id,
    });


    if (memberError) {
      setError("Chat erstellt, aber kein Mitgliedseintrag: " + memberError.message);
    } else {
      setSuccess("Chat erfolgreich erstellt ✅");
      setChatName("");
      setSelectedTeamId(null);
      onCreated?.(); // Optionaler Refresh
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleCreate}
      className="max-w-md bg-white dark:bg-gray-800 p-6 rounded shadow space-y-4"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">➕ Chat erstellen</h2>

      <input
        type="text"
        placeholder="Chatname"
        value={chatName}
        onChange={(e) => setChatName(e.target.value)}
        required
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      <select
        value={selectedTeamId || ""}
        onChange={(e) => setSelectedTeamId(e.target.value)}
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="">Kein Team zugewiesen</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      {success && <p className="text-green-500 text-sm">{success}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
      >
        {loading ? "Erstelle..." : "Chat erstellen"}
      </button>
    </form>
  );
}
