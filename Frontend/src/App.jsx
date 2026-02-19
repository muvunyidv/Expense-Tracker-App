import { useState, useEffect } from "react"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"

export default function App() {
  // 1. Initialize state directly from storage
  // We check both session and local just in case, but prioritize session
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = sessionStorage.getItem("user");
    return user !== null;
  });

  // 2. Handle Login
  const handleLogin = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  // 3. Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user"); // Cleanup just in case
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </>
  );
}