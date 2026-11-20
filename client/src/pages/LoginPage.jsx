import { useState } from "react";

export default function LoginPage() {
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: fields.get("email"), password: fields.get("password") })
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message);
      }
      window.location.replace("/");
    } catch (err) {
      setError(err instanceof TypeError || err instanceof SyntaxError
        ? "Unable to reach BooksMart. Please try again."
        : err.message);
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <a className="logo" href="/">Books<span>Mart.</span></a>
      <form className="book-form" onSubmit={signIn}>
        <h1>Sign in</h1>
        <fieldset disabled={pending}>
          <legend>Account type</legend>
          {["user", "admin"].map((type) => (
            <label key={type}>
              <input type="radio" name="role" checked={role === type}
                onChange={() => { setRole(type); setError(""); }} />
              {type === "admin" ? "Admin" : "User"}
            </label>
          ))}
        </fieldset>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        {error && <p role="alert">{error}</p>}
        <button className="submit-book-button" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <a href="/">Back to books</a>
      </form>
    </main>
  );
}
