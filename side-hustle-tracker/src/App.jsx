import { BrowserRouter as Router, Routes, Route } from "react-router-dom"


import Layout from "./components/Visuals/Layout"
import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Profile/Login"
import Register from "./pages/Profile/Register"
import Dashboard from "./pages/Dashboard/Dashboard"
import Projects from "./pages/Project/Projects"
import ProjectDetail from "./pages/Project/ProjectDetail"
import Transaction from "./pages/Transaction/Transactions"
import TeamsPage from "./pages/Team/TeamsPage"
import TeamDetail from "./pages/Team/TeamDetail"
import TeamCreate from "./pages/Team/TeamCreate"
import Chats from "./pages/Chat/Chats"
import ChatDetail from "./pages/Chat/ChatDetails"
import ProfilePage from "./pages/Profile/ProfilePage"
import ProjectsArchive from "./pages/Project/ProjectsArchive"

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
          path="/projects/archive"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectsArchive />
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
