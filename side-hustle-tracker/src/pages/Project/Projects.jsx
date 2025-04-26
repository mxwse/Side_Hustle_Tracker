import ProjectList from "../../components/Project/ProjectList"
import ThemeToggle from "../../components/Visuals/ThemeToggle"

export default function Projects() {
  return (
    
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <ThemeToggle />
      <h1 className="text-2xl font-bold mb-6">Meine Projekte</h1>
      <div className="">
        <ProjectList filter={true}/>
      </div>
    </div>
  )
}
