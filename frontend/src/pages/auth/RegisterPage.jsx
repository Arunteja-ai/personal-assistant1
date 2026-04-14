import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RegisterPage = () => {
  const { register, getErrorMessage } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const user = await register(form);
      navigate(user.role === "admin" ? "/admin" : "/app", { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to create the account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-app-bg lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex items-center justify-center px-4 py-8 md:px-8">
        <div className="panel w-full max-w-xl p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.24em] text-app-muted">Account Setup</p>
          <h2 className="mt-3 font-display text-4xl text-app-ink">Create your workspace</h2>
          <p className="mt-3 text-sm leading-6 text-app-muted">
            Register once and the system automatically decides whether you belong in the user
            experience or the admin control center.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-app-ink">Full name</span>
              <input
                type="text"
                className="field"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-app-ink">Email</span>
              <input
                type="email"
                className="field"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-app-ink">Password</span>
              <input
                type="password"
                className="field"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-app-danger/20 bg-app-dangerSoft px-4 py-3 text-sm text-app-danger">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-app-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-app-muted">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-app-accent">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden overflow-hidden bg-[#faf4e8] p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-app-muted">System Vision</p>
          <h1 className="mt-6 max-w-2xl font-display text-6xl leading-[1.02] text-app-ink">
            Personal productivity on the surface. Full SaaS control underneath.
          </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Goal orchestration and task execution",
            "Habit streaks and reflective daily logging",
            "Finance tracking with trend visibility",
            "Admin control over users, sessions, audits, and data",
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-app-line bg-white/70 px-5 py-5">
              <p className="text-sm leading-6 text-app-ink">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
