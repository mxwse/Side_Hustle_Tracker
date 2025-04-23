import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AddProject from "../AddTableRow/AddProject";

export default function ProjectList({ refresh, addProject, filter =true }) {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      let query = supabase
        .from("projects")
        .select("*, teams(*)")
        .order("created_at", { ascending: false });

      if (selectedTeamId) {
        query = query.eq("team_id", selectedTeamId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Fehler beim Laden der Projekte:", error);
        setError("Fehler beim Laden der Projekte.");
      } else {
        setProjects(data);
      }
    } catch (err) {
      console.error("❌ Unerwarteter Fehler:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams(name)")
      .eq("user_id", user.id);

    if (!error) {
      setTeams(data);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [refresh, selectedTeamId]);

  if (loading) return <p className="mt-4">⏳ Lade Projekte...</p>;

  if (error)
    return <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div>
      {addProject === 1 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-4">
          <AddProject onProjectAdded={fetchProjects} />
        </div>
      )}

      {/* Team-Filter */}
      <div className={filter ? "mb-4" : "hidden"}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          🔽 Team filtern:
        </label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="w-full md:w-64 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Alle Teams</option>
          {teams.map((team) => (
            <option key={team.team_id} value={team.team_id}>
              {team.teams?.name || team.team_id}
            </option>
          ))}
        </select>
      </div>

      {projects.length === 0 ? (
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Keine Projekte für dieses Team vorhanden.
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
