import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProjectDetails({ projectId }) {
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, profiles(username), teams(name)")
        .eq("id", projectId)
        .single();

      if (!error) {
        setProject(data);
      } else {
        console.error("Fehler beim Laden des Projekts:", error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (!project) {
    return <p className="text-gray-500 dark:text-gray-400">Projekt wird geladen...</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold">Projektbeschreibung:</span>{" "}
        {project.description || "Keine Angaben."}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold">Erstellt durch:</span>{" "}
        {project.profiles?.username || project.user_id?.slice(0, 6) || "Unbekannt"}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold">Team:</span>{" "}
        {project.teams?.name || "Unbekannt"}
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold">Erstellt am:</span>{" "}
        {new Date(project.created_at).toLocaleDateString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })} Uhr
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        <span className="font-semibold">Projekt-ID:</span>{" "}
        {project.id || "Unbekannt"}
      </p>
    </div>
  );
}
