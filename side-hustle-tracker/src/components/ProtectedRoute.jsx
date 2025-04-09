import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        navigate("/login", { replace: true })
      }

      setLoading(false)
    }

    checkSession()
  }, [navigate])

  if (loading) {
    return <div className="p-6">⏳ Lade Benutzer...</div>
  }

  return children
}
