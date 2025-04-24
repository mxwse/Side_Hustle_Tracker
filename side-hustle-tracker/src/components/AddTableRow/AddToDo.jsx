import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AddToDo({ projectId, onTodoAdded }) {
  const [dueDate, setDueDate] = useState("");
  const [newTask, setNewTask] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Fehler beim Laden des Profils:", profileError.message);
      } else {
        setProfile(profileData);
      }
    };

    fetchUserAndProfile();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !user || !profile) return;

    const { error } = await supabase.from("todos").insert({
      project_id: projectId,
      description: newTask,
      done: false,
      created_by: profile.username,
      due_date: dueDate || null,
    });

    if (!error) {
      setNewTask("");
      setDueDate("");
      onTodoAdded?.(); // 🔁 ToDo-Liste im Parent aktualisieren
    } else {
      console.error("Fehler beim Einfügen des Todos:", error.message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        To Do Liste
      </h2>

      <form onSubmit={addTodo} className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Neue Aufgabe..."
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Hinzufügen
        </button>
      </form>
    </div>
  );
}
