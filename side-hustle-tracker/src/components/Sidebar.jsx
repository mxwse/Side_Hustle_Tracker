import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const [teamOpen, setTeamOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }
  return (
    <>
      {/* Hamburger Button – nur auf Mobile sichtbar */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-200 dark:bg-gray-700 p-2 rounded shadow"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="text-gray-800 dark:text-white" /> : <Menu className="text-gray-800 dark:text-white" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Menü</h2>
          <nav className="space-y-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`
              }
              onClick={() => setOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`
              }
              onClick={() => setOpen(false)}
            >
              Projekte
            </NavLink>
            <NavLink
              to="/Transactions"
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`
              }
              onClick={() => setOpen(false)}
            >
              Transaktionen
            </NavLink>
            {/* Team Dropdown */}
            <div>
              <button
                onClick={() => setTeamOpen((prev) => !prev)}
                className="w-full text-left px-4 py-2 rounded transition-colors flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span>Team</span>
                <span>{teamOpen ? "▲" : "▼"}</span>
              </button>
              {teamOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <NavLink
                    to="/Teams"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    Meine Teams
                  </NavLink>
                  <NavLink
                    to="/teams/chat"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    Chat
                  </NavLink>
                  <NavLink
                    to="/teams/create"
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    Team erstellen
                  </NavLink>
                </div>
              )}
            </div>
            <NavLink
              to="/ProfilePage"
              className={({ isActive }) =>
                `block px-4 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`
              }
              onClick={() => setOpen(false)}
            >
              Profil
            </NavLink>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 rounded transition-colors"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}
