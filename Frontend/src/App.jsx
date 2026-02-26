import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

export default function App() {
  // 1. Initialize state with both auth status and user data
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("token") !== null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Handle Login
  const handleLogin = (userData) => {
    // Auth.jsx should pass the user object here after successful login/reg
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setIsAuthenticated(true);
  };

  // 3. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    window.location.hash = ""; 
  };

  // 4. Sync Auth State (Optional: helps if user clears storage manually)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      {isAuthenticated ? (
        // Pass the user data to the Dashboard so the Sidebar can use it
        <Dashboard onLogout={handleLogout} user={user} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  );
}
