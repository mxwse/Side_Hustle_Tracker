import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ToDoHistory from "./ToDoHistory";

export default function Todos({ projectId, list = true}) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dueDate, setDueDate] = useState("");

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
      due_date: dueDate || null,
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
        
      <ul className="space-y-2">
      {todos
        .filter((todo) => !todo.done)
        .sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        })
        .map((todo) => {
          const today = new Date();
          const due = todo.due_date ? new Date(todo.due_date) : null;
          let badgeColor = "bg-green-500";
          if (due) {
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) badgeColor = "bg-red-500";
            else if (diffDays === 0) badgeColor = "bg-orange-500";
            else if (diffDays <= 3) badgeColor = "bg-yellow-500";
          }

          return (
            <li key={todo.id} className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleDone(todo)}
                />
                <span className="text-gray-900 dark:text-white">{todo.description}</span>
              </label>
              {todo.due_date && (
                <span className={`text-xs px-2 py-1 rounded text-white ${badgeColor}`}>
                  Fällig: {todo.due_date}
                </span>
              )}
            </li>
          );
        })}

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
