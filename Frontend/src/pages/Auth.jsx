import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card"
import { ThemeToggle } from "../Components/ThemeToggle"

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = () => {
    if (isSignup) {
      if (password !== confirmPassword) return alert("Passwords do not match")

      localStorage.setItem("user", JSON.stringify({ username, password }))
      setIsSignup(false)
    } else {
      const storedUser = JSON.parse(localStorage.getItem("user"))
      if (
        storedUser &&
        storedUser.username === username &&
        storedUser.password === password
      ) {
        onLogin()
      } else {
        alert("Invalid credentials")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-gray-300/60 dark:border-zinc-700/60">
        <CardHeader>
          <CardTitle className="text-center">
            {isSignup ? "Create an account" : "Welcome back"}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            {isSignup
              ? "Sign up to start tracking your expenses"
              : "Login to access your dashboard"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-background"
            />
          </div>

          {isSignup && (
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-background"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            {isSignup ? "Create Account" : "Login"}
          </button>

          <p className="text-sm text-center text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don’t have an account?"}
            <span
              onClick={() => setIsSignup(!isSignup)}
              className="ml-1 text-primary cursor-pointer"
            >
              {isSignup ? "Login" : "Sign up"}
            </span>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

export default Auth
