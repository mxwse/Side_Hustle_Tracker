import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Login from "./pages/Login"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Register from "./pages/Register"
import ProjectDetail from "./pages/ProjectDetail"
import Transaction from "./pages/Transactions"
import TeamsPage from "./pages/TeamsPage"
import TeamDetail from "./pages/TeamDetail"
import ProfilePage from "./pages/ProfilePage"
import TeamCreate from "./pages/TeamCreate"
import Chats from "./pages/Chats"
import ChatDetail from "./pages/ChatDetails"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Layout>
                <Projects />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/register"
          element={<Register />
          } 
        />

        <Route
          path="/project/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <Transaction />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/create"
          element={
            <ProtectedRoute>
              <Layout>
                <TeamCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <Chats />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profilepage"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route 
        path="/chats/:chatId"
        element={
          <ProtectedRoute>
          <Layout>
            <ChatDetail />
          </Layout>
        </ProtectedRoute>
        }
      />
      </Routes>
    </Router>
  )
}

export default App
