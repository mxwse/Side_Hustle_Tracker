import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AddTeamDetails({ teamId }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    fax: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [existingId, setExistingId] = useState(null); // ← merken, ob schon Datensatz vorhanden ist

  useEffect(() => {
    const fetchDetails = async () => {
      if (!teamId) return;

      const { data, error } = await supabase
        .from("company_details")
        .select("*")
        .eq("team_id", teamId)
        .single(); // ← max. 1 Zeile pro Team

      if (error && error.code !== "PGRST116") {
        console.error("Fehler beim Laden:", error.message);
      }

      if (data) {
        setForm({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          fax: data.fax || "",
          email: data.email || "",
        });
        setExistingId(data.id);
      }
    };

    fetchDetails();
  }, [teamId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    let result;

    if (existingId) {
      // 🔁 Update
      result = await supabase
        .from("company_details")
        .update({ ...form })
        .eq("id", existingId);
    } else {
      // ➕ Insert
      result = await supabase
        .from("company_details")
        .insert({ ...form, team_id: teamId });
    }

    if (result.error) {
      console.error("❌ Fehler beim Speichern:", result.error.message);
    } else {
      setSuccess("✅ Teamdaten gespeichert!");
      if (!existingId) setExistingId(result.data?.[0]?.id); // nach Insert ID merken
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
        {existingId ? "✏️ Teamdaten bearbeiten" : "📋 Teamdetails hinzufügen"}
      </h2>

      {["name", "address", "phone", "fax", "email"].map((field) => (
        <input
          key={field}
          type={field === "email" ? "email" : "text"}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      ))}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow disabled:opacity-50"
      >
        {loading ? "Speichern..." : "Teamdaten speichern"}
      </button>

      {success && <p className="text-green-600 mt-2">{success}</p>}
    </form>
  );
}
