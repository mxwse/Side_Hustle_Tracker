import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/ThemeToggle";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(user);
      setUsername(profileData?.username || "");
      setAvatarUrl(profileData?.avatar_url || "");
      setEmail(user.email);
    };

    loadProfile();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from("avatars")
      .getPublicUrl(filePath);

    setAvatarUrl(publicUrl);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!profile) return;

    // Update profile
    await supabase
      .from("profiles")
      .update({ username, avatar_url: avatarUrl })
      .eq("id", profile.id);

    // Update email
    if (email !== profile.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) console.error("Email update error:", error.message);
    }

    // Update password
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) console.error("Password update error:", error.message);
    }

    setMessage("Profil gespeichert ✅");
    setNewPassword("");
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-white dark:bg-gray-800 rounded shadow">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">👤 Mein Profil</h1>
        <ThemeToggle />
      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profilbild</label>
          {avatarUrl && (
            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleAvatarUpload} />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nutzername</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail-Adresse</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Passwort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Neues Passwort</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mt-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="●●●●●●●●"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Speichern..." : "Änderungen speichern"}
        </button>

        {/* Feedback */}
        {message && <p className="text-green-500 text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}