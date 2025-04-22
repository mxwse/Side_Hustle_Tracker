import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { ChevronDown } from "lucide-react";

import ToDoHistory from "./ToDoHistory";

export default function Todos({ projectId, active = true, create = true }) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [openNotes, setOpenNotes] = useState({}); // { [todoId]: boolean }
  const [noteDrafts, setNoteDrafts] = useState({}); // { [todoId]: string }

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

  function getDueColor(dateString) {
    const today = new Date();
    const due = new Date(dateString);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  
    if (diff < 0) return "bg-red-500";
    if (diff === 0) return "bg-yellow-500";
    if (diff <= 3) return "bg-orange-500";
    return "bg-green-500";
  }
  const saveNote = async (id) => {
    const newNote = noteDrafts[id] ?? "";
    const { error } = await supabase
      .from("todos")
      .update({ note: newNote })
      .eq("id", id);
  
    if (error) {
      console.error("Fehler beim Speichern der Notiz:", error.message);
    } else {
      setOpenNotes((prev) => ({ ...prev, [id]: false }));
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className={create ? "" : "hidden"}> 
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
      <ul className={active ? "space-y-2" : "hidden"}>
      {todos
        .filter((todo) => !todo.done)
        .sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        })
        .map((todo) => {
          return (
            <li
              key={todo.id}
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded shadow cursor-pointer"
              onClick={() =>
                setOpenNotes((prev) => ({
                  ...prev,
                  [todo.id]: !prev[todo.id],
                }))
              }
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleDone(todo);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-gray-900 dark:text-white">{todo.description}</span>
                </label>
                <div className="flex items-center gap-3">
                  {todo.due_date && (
                    <span
                      className={`text-xs px-2 py-1 rounded text-white ${getDueColor(
                        todo.due_date
                      )}`}
                    >
                      Fällig: {todo.due_date}
                    </span>
                  )}

                  {/* 🔽 Chevron Icon */}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openNotes[todo.id] ? "rotate-180" : ""
                    } text-gray-500 dark:text-gray-300`}
                  />
                </div>
              </div>

              {openNotes[todo.id] && (
                <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    rows={3}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={noteDrafts[todo.id] ?? todo.note ?? ""}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({
                        ...prev,
                        [todo.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    onClick={() => saveNote(todo.id)}
                  >
                    Speichern
                  </button>
                </div>
              )}
            </li>
          );
        })}

      </ul>

      <hr className="my-4 border-gray-300 dark:border-gray-600"/>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        To Do's Verlauf
      </h3>
      <ToDoHistory todos={todos} />
    </div>
  );
}
