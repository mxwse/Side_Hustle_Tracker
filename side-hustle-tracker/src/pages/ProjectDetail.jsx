import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/ThemeToggle"
import TransactionList from "../components/TransactionList";
import CommentList from "../components/CommentList";
import AddComment from "../components/AddComment";
import AddEntry from "../components/AddEntry";

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (!error) {
        setProject(data);
      }
    };

    fetchProject();
  }, [projectId]);

  const tabs = [
    { key: "overview", label: "Übersicht" },
    { key: "details", label: "Details" },
    { key: "entries", label: "Buchungen" },
    { key: "comments", label: "Kommentare" },
    { key: "notes", label: "Notizen" },
  ];

  if (!project) return <p className="p-6">Projekt wird geladen...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <ThemeToggle />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {project.name}
      </h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 font-medium rounded-t transition-colors duration-200 ${
                selectedTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div>
          <p className="text-gray-700 dark:text-gray-300">Hier kommt deine Projektübersicht hin – z. B. Charts, Summen, etc.</p>
        </div>
      )}

      {selectedTab === "details" && (
        <div>
          <p className="text-gray-700 dark:text-gray-300">Projektbeschreibung: {project.description || "Keine Angaben."}</p>
        </div>
      )}

      {selectedTab === "entries" && (
        <div className="space-y-4">
          <AddEntry />
          <TransactionList limit={9} scrollable={false} project={projectId}/>
        </div>
      )}

      {selectedTab === "comments" && (
        <div className="space-y-4">
          <AddComment projectId={projectId} />
          <CommentList projectId={projectId} />
        </div>
      )}

      {selectedTab === "notes" && (
        <div>
          <p className="text-gray-700 dark:text-gray-300">📝 Notizen-Bereich (noch leer)</p>
        </div>
      )}
    </div>
  );
}
