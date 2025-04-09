import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem("theme") === "dark"
  )

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-gray-800 text-sm px-3 py-1 rounded shadow hover:scale-105 transition"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  )
}
