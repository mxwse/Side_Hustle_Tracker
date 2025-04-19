import Sidebar from "./Sidebar"

export default function Layout({ children }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="pt-4 md:ml-64 p-6 transition-all duration-300">{children}</main>
    </div>
  )
}
