import { useEffect, useState } from "react";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";
import "./styles/storefront.css";

export default function App() {
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");
  const loginPage = window.location.pathname.replace(/\/$/, "") === "/login";

  useEffect(() => {
    if (loginPage) return;
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then((response) => response.json())
      .then((session) => setRole(session.role))
      .catch(() => {});
    return () => controller.abort();
  }, [loginPage]);

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      setRole(null);
      setError("");
    } catch {
      setError("Sign-out failed. Please try again.");
    }
  }

  if (loginPage) return <LoginPage />;
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <CatalogPage key={role} role={role} onLogout={logout} />
    </>
  );
}
