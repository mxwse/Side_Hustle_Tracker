export default function ToDoHistory({ todos }) {
  if (!todos || todos.length === 0) return null;

  // Filter todos to only include those that are done
  const completedTodos = todos.filter((todo) => todo.done);

  // If there are no completed todos, return null
  if (completedTodos.length === 0) return null;

  // Render the list of completed todos
    return(
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 max-h-40 overflow-y-auto">
            {todos
            .filter((todo) => todo.done)
            .map((todo) => (
                <li key={`history-${todo.id}`}>
                ✅ <strong>{todo.completed_by}</strong> hat „{todo.description}“ am {new Date(todo.completed_at).toLocaleDateString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    })} Uhr erledigt.
                </li>
            ))}
        </ul>
    )
}