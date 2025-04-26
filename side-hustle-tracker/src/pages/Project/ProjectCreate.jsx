import AddProject from '../../components/AddTableRow/AddProject';
import ThemeToggle from "../../components/Visuals/ThemeToggle";

export default function ProjectCreate() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <ThemeToggle />
        <h1 className="text-2xl font-bold mb-6">Neues Projekt anlegen</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 space-y-4">
            <AddProject />
        </div>
    </div>
  );
}