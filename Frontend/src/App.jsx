import { useEffect, useState } from "react"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) setIsAuthenticated(true)
    setCheckedAuth(true)
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData))
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsAuthenticated(false)
  }

  if (!checkedAuth) return null // optional: show a loader here

  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </>
  )
}
