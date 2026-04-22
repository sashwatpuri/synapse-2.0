import { useState } from "react";

export function AuthPanel({ authHints, onLogin }) {
  const [form, setForm] = useState({
    username: authHints.admin.username,
    password: authHints.admin.password
  });
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const result = onLogin(form.username, form.password);
    if (!result.ok) {
      setMessage(result.message);
    }
  };

  const applyHint = (hint) => {
    setForm({
      username: hint.username,
      password: hint.password
    });
    setMessage("");
  };

  return (
    <section className="auth-shell">
      <div className="auth-card reveal">
        <div className="title-block">
          <h1>Synapse Access Control</h1>
          <p>
            Sign in as admin to manage all farmer records, or sign in as a farmer to view only your own plots,
            sensor readings, and certification status.
          </p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label className="control">
            Username
            <input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>

          <label className="control">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <button type="submit">Sign In</button>
          {message ? <p className="metric-sub auth-error">{message}</p> : null}
        </form>

        <div className="auth-hints">
          <button className="secondary" type="button" onClick={() => applyHint(authHints.admin)}>
            Use Admin Demo
          </button>
          {authHints.farmer ? (
            <button className="secondary" type="button" onClick={() => applyHint(authHints.farmer)}>
              Use Farmer Demo
            </button>
          ) : null}
        </div>

        <p className="footnote">
          Default admin login: <strong>{authHints.admin.username}</strong> / <strong>{authHints.admin.password}</strong>
          {authHints.farmer ? ` | Sample farmer login: ${authHints.farmer.username} / ${authHints.farmer.password}` : ""}
        </p>
      </div>
    </section>
  );
}
