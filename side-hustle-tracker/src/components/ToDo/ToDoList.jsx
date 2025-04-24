import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ToDoList({todos, active = true, onUpdated }) {
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState({});
  const now = new Date();

  const markDone = async (id) => {
    const { error } = await supabase
      .from("todos")
      .update({ done: true , completed_at: now })
      .eq("id", id);

    if (!error) onUpdated?.();
  };

  const updateNote = async (id) => {
    const note = notes[id] || "";
    const { error } = await supabase
      .from("todos")
      .update({ note })
      .eq("id", id);

    if (!error) onUpdated?.();
  };

  const getHighlightColor = (todo) => {
    if (!todo.due_date || todo.done) return "";

    const due = new Date(todo.due_date);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) return "border-l-4 border-red-500";
    if (diffDays <= 5) return "border-l-4 border-orange-400";
    if (diffDays <= 10) return "border-l-4 border-yellow-300";
    return "border-l-4 border-green-400";
  };

  return (
    <div>
      <ul className="space-y-2">
        {todos
          .filter((t) => t.done !== active)
          .map((todo) => {
            const dueDate = todo.due_date ? new Date(todo.due_date) : null;
            const isExpanded = expandedId === todo.id;

            return (
              <li
                key={todo.id}
                className={`p-3 rounded shadow bg-white dark:bg-gray-800 ${getHighlightColor(todo)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {todo.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {todo.created_by} •{" "}
                      {dueDate
                        ? "Fällig: " + dueDate.toLocaleDateString("de-DE")
                        : "Kein Fälligkeitsdatum"}•{" "}
                      {todo.created_at
                        ? "Erstellt: " +
                          new Date(todo.created_at).toLocaleDateString("de-DE")
                        : ""} •{" "}
                      {todo.completed_at
                        ? "Erledigt: " +
                          new Date(todo.completed_at).toLocaleDateString("de-DE")
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!todo.done && (
                      <button
                        onClick={() => markDone(todo.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-700 dark:hover:bg-green-600 dark:text-white transition"
                      >
                        Erledigen
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : todo.id)
                      }
                      className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-lg"
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4">
                    <textarea
                      rows={3}
                      placeholder="Notiz hinzufügen..."
                      value={notes[todo.id] ?? todo.note ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [todo.id]: e.target.value,
                        }))
                      }
                      className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="text-right mt-2">
                    {!todo.done && (
                      <button
                        onClick={() => updateNote(todo.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
                      >
                        Speichern
                      </button>
                    )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
      </ul>

      {todos.filter((t) => t.done !== active).length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {active ? "Keine offenen Aufgaben." : "Noch keine erledigten Aufgaben."}
        </p>
      )}
    </div>
  );
}
