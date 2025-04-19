import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ToDoHistory from "./ToDoHistory";

export default function Todos({ projectId, list = true}) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchUserAndTodos = async () => {
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

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (!error) setTodos(data);
    };

    fetchUserAndTodos();
  }, [projectId]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !user || !profile) return;

    const { error } = await supabase.from("todos").insert({
      project_id: projectId,
      description: newTask,
      done: false,
      created_by: profile.username,
    });

    if (!error) {
      setNewTask("");
      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      setTodos(data);
    }
  };

  const toggleDone = async (todo) => {
    const { error } = await supabase
      .from("todos")
      .update({
        done: !todo.done,
        completed_by: !todo.done ? profile.username || user.email : null,
        completed_at: !todo.done ? new Date().toISOString() : null,
      })
      .eq("id", todo.id);

    if (!error) {
      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      setTodos(data);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className={list ? "" : "hidden"}> 
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                ✅ To Do Liste
            </h2>

            <form onSubmit={addTodo} className="flex gap-2 mb-4">
                <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Neue Aufgabe..."
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Hinzufügen
                </button>
            </form>
        
      <ul className="space-y-2">
        {todos
          .filter((todo) => !todo.done)
          .map((todo) => (
            <li key={todo.id} className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleDone(todo)}
                />
                <span className="text-gray-900 dark:text-white">
                  {todo.description}
                </span>
              </label>
            </li>
          ))}
      </ul>

      <hr className="my-4 border-gray-300 dark:border-gray-600"/>
      </div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        To Do's Verlauf
      </h3>
      <ToDoHistory todos={todos} />
    </div>
  );
}
