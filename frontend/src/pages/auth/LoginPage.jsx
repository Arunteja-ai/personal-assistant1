import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AuthShell = ({ title, description, footer, children }) => (
  <div className="grid min-h-screen bg-app-bg lg:grid-cols-[1.1fr_0.9fr]">
    <div className="relative hidden overflow-hidden bg-[#132126] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.55),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(161,98,7,0.4),transparent_40%)]" />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.32em] text-white/70">AI Personal Assistant</p>
        <h1 className="mt-6 max-w-xl font-display text-6xl leading-[1.05]">
          Operate your life with user calm and admin-grade clarity.
        </h1>
      </div>
      <div className="relative z-10 max-w-lg">
        <p className="text-sm leading-7 text-white/80">
          A production-minded dashboard for goals, finance, habits, notes, and system-level control.
          Designed to feel less like a project demo and more like a real operating console.
        </p>
      </div>
    </div>

    <div className="flex items-center justify-center px-4 py-8 md:px-8">
      <div className="panel w-full max-w-xl p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-app-muted">Secure Access</p>
        <h2 className="mt-3 font-display text-4xl text-app-ink">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-app-muted">{description}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-sm text-app-muted">{footer}</p>
      </div>
    </div>
  </div>
);

const LoginPage = () => {
  const { login, getErrorMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const user = await login(form);
      const fallback = user.role === "admin" ? "/admin" : "/app";
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue into your workspace or the full admin control plane."
      footer={
        <>
          Need an account?{" "}
          <Link to="/register" className="font-semibold text-app-accent">
            Create one here
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-app-ink">Email</span>
          <input
            type="email"
            className="field"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
