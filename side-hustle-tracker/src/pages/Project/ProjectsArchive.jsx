import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import ProjectTeamFilter from "../../components/Project/ProjectTeamFilter";

export default function ProjectsArchive() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTeams = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams(name)")
      .eq("user_id", user.id);

    if (!error) {
      setTeams(data || []);
    }
  };

  const fetchArchivedProjects = async () => {
    setLoading(true);

    let query = supabase
      .from("projects")
      .select("*, teams(name)")
      .eq("is_archived", true)
      .order("created_at", { ascending: false });

    if (selectedTeamId) {
      query = query.eq("team_id", selectedTeamId);
    }

    const { data, error } = await query;

    if (!error) {
      setProjects(data || []);
    } else {
      console.error("Fehler beim Laden der archivierten Projekte:", error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchArchivedProjects();
  }, [selectedTeamId]);

  if (loading) return <p className="mt-4">⏳ Lade Projekte...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Archivierte Projekte
      </h1>

      <ProjectTeamFilter
        teams={teams}
        selectedTeamId={selectedTeamId}
        onChange={setSelectedTeamId}
      />

      {projects.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          Keine archivierten Projekte für dieses Team gefunden.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse bg-white dark:bg-gray-800 shadow rounded">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm tracking-wider">
              <tr>
                <th className="text-left p-3">Projektname</th>
                <th className="text-left p-3">Beschreibung</th>
                <th className="text-left p-3">Team</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">
                    {project.name}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    {project.description || "–"}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    {project.teams?.name || "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
