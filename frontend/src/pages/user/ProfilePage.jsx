import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../api/client";
import { DataTable } from "../../components/tables/DataTable";
import { SectionHeading } from "../../components/SectionHeading";
import { useAuth } from "../../hooks/useAuth";
import { formatDateTime } from "../../utils/formatters";

const ProfilePage = () => {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [profileResponse, sessionsResponse] = await Promise.all([
          api.get("/profile"),
          api.get("/profile/sessions"),
        ]);

        setProfile({
          ...profileResponse.data.data,
          focusMode: profileResponse.data.data.preferences?.focusMode || false,
          weeklySummaryEmail:
            profileResponse.data.data.preferences?.weeklySummaryEmail || false,
          startOfWeek: profileResponse.data.data.preferences?.startOfWeek || "monday",
        });
        setSessions(sessionsResponse.data.data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, "Unable to load profile information."));
      }
    };

    load();
  }, []);

  if (!profile) {
    return (
      <div className="rounded-[28px] border border-app-line bg-white/80 px-6 py-16 text-center text-sm text-app-muted">
        {error || "Loading profile and session data..."}
      </div>
    );
  }

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.patch("/profile", {
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        timezone: profile.timezone,
        currency: profile.currency,
        avatarUrl: profile.avatarUrl,
        preferences: {
          focusMode: profile.focusMode,
          weeklySummaryEmail: profile.weeklySummaryEmail,
          startOfWeek: profile.startOfWeek,
        },
      });
      await refreshProfile();
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to update the profile."));
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.patch("/profile/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Password updated successfully.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to update the password."));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Profile Settings"
        title="Identity, preferences, and active sessions"
        description="Update your public profile, operational preferences, and review every live session tied to your account."
      />

      {message ? (
        <div className="rounded-[24px] border border-app-accent/20 bg-app-accentSoft px-4 py-3 text-sm text-app-accent">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[24px] border border-app-danger/20 bg-app-dangerSoft px-4 py-3 text-sm text-app-danger">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <form className="rounded-[28px] border border-app-line bg-white/80 p-5" onSubmit={saveProfile}>
          <h3 className="font-display text-xl text-app-ink">Profile details</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input className="field" value={profile.name || ""} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" />
            <input className="field" value={profile.title || ""} onChange={(event) => setProfile((current) => ({ ...current, title: event.target.value }))} placeholder="Title" />
            <input className="field" value={profile.timezone || ""} onChange={(event) => setProfile((current) => ({ ...current, timezone: event.target.value }))} placeholder="Timezone" />
            <input className="field" value={profile.currency || ""} onChange={(event) => setProfile((current) => ({ ...current, currency: event.target.value }))} placeholder="Currency" />
            <input className="field md:col-span-2" value={profile.avatarUrl || ""} onChange={(event) => setProfile((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="Avatar URL" />
            <textarea className="field md:col-span-2" rows={5} value={profile.bio || ""} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} placeholder="Short bio" />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="rounded-[22px] border border-app-line bg-app-bg/50 px-4 py-4 text-sm text-app-ink">
              <span className="block font-semibold">Focus mode</span>
              <input type="checkbox" className="mt-3" checked={profile.focusMode} onChange={(event) => setProfile((current) => ({ ...current, focusMode: event.target.checked }))} />
            </label>
            <label className="rounded-[22px] border border-app-line bg-app-bg/50 px-4 py-4 text-sm text-app-ink">
              <span className="block font-semibold">Weekly summary email</span>
              <input type="checkbox" className="mt-3" checked={profile.weeklySummaryEmail} onChange={(event) => setProfile((current) => ({ ...current, weeklySummaryEmail: event.target.checked }))} />
            </label>
            <label className="rounded-[22px] border border-app-line bg-app-bg/50 px-4 py-4 text-sm text-app-ink">
              <span className="block font-semibold">Start of week</span>
              <select className="field mt-3" value={profile.startOfWeek} onChange={(event) => setProfile((current) => ({ ...current, startOfWeek: event.target.value }))}>
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </label>
          </div>

          <button type="submit" className="mt-5 rounded-full bg-app-accent px-5 py-3 text-sm font-semibold text-white">
            Save Profile
          </button>
        </form>

        <form className="rounded-[28px] border border-app-line bg-white/80 p-5" onSubmit={savePassword}>
          <h3 className="font-display text-xl text-app-ink">Security</h3>
          <div className="mt-5 space-y-4">
            <input type="password" className="field" placeholder="Current password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
            <input type="password" className="field" placeholder="New password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
          </div>
          <button type="submit" className="mt-5 rounded-full bg-app-warm px-5 py-3 text-sm font-semibold text-white">
            Update Password
          </button>
        </form>
      </div>

      <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
        <h3 className="font-display text-xl text-app-ink">Active sessions</h3>
        <div className="mt-5">
          <DataTable
            columns={[
              { key: "ipAddress", header: "IP", render: (row) => row.ipAddress || "Unknown" },
              { key: "userAgent", header: "User agent", render: (row) => row.userAgent || "Unknown" },
              { key: "createdAt", header: "Issued", render: (row) => formatDateTime(row.createdAt) },
              { key: "expiresAt", header: "Expires", render: (row) => formatDateTime(row.expiresAt) },
            ]}
            rows={sessions}
            emptyMessage="No active sessions were found."
          />
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
