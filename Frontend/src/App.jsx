import { useState } from "react"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"

export default function App() {
  // 1. Initialize state from localStorage (where your Auth page saves the token)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("token") !== null;
  });

  // 2. Handle Login
  const handleLogin = () => {
    // We don't need to pass userData here because Auth.jsx 
    // already saved the token to localStorage
    setIsAuthenticated(true);
  };

  // 3. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    // This will force the URL back to clean state
    window.location.hash = ""; 
  };

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}