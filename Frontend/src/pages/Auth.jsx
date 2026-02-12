import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card"
import AuthBack from "../assets/Auth-Back.jpg"

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [PhoneNumber, setPhoneNumber] = useState("")
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
    <div className="min-h-screen relative overflow-hidden">
      {/* full-page background image with dark overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${AuthBack})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
        <Card className="w-full max-w-md border-gray-300/60 bg-white/95 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-black">
            {isSignup ? "Create an account" : "Welcome back"}
          </CardTitle>
          <p className="text-sm text-gray-600 text-center">
            {isSignup
              ? "Sign up to start tracking your expenses"
              : "Login to access your dashboard"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">

            {isSignup && (
            <div>
            <label className="text-sm font-medium text-black">Phone Number</label>
            <input
              type="number"
              value={PhoneNumber}
              onChange={e => setPhoneNumber (e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-white text-black border-gray-300"
            />
          </div>
            )}

          <div>
            <label className="text-sm font-medium text-black">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-white text-black border-gray-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-white text-black border-gray-300"
            />
          </div>

          {isSignup && (
            <div>
              <label className="text-sm font-medium text-black">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-white text-black border-gray-300"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition shadow-sm border border-orange-500"
          >
            {isSignup ? "Create Account" : "Login"}
          </button>

          <p className="text-sm text-center text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsSignup(!isSignup);
              }}
              className="ml-1 text-orange-500 underline hover:opacity-90"
            >
              {isSignup ? "Login" : "Sign up"}
            </a>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

export default Auth
