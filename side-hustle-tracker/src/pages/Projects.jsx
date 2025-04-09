import ProjectList from "../components/ProjectList"

export default function Projects() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">📁 Meine Projekte</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <ProjectList />
      </div>
    </div>
  )
}
