export default function ProjectTeamFilter({ teams, selectedTeamId, onChange }) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          🔽 Team filtern:
        </label>
        <select
          value={selectedTeamId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full md:w-64 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Alle Teams</option>
          {Array.isArray(teams) && teams.map((team) => (
            <option key={team.team_id} value={team.team_id}>
              {team.teams?.name || team.team_id}
            </option>
          ))}
        </select>
      </div>
    );
  }