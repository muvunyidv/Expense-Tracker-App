import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import AuthBack from "../assets/Auth-Back.jpg";
import API from "../api";

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    phonenumber: "", // Matches backend variable name exactly
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, phonenumber } = formData;

    // 1. Frontend Validation
    if (!username || !password || (isSignup && (!phonenumber || !confirmPassword))) {
      return setError("All fields are required");
    }

    if (isSignup && password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      setError("");

      if (isSignup) {
        // Registration Logic
        await API.post("/auth/register", {
          username: username.trim(),
          password,
          phonenumber: phonenumber.trim(),
        });

        alert("Account created successfully! Please login.");
        setIsSignup(false);
        setFormData({ username: "", password: "", confirmPassword: "", phonenumber: "" });
      } else {
        // Login Logic - Now using username as the identifier
        const res = await API.post("/auth/login", { 
          username: username.trim(), 
          password 
        });
        
        localStorage.setItem("token", res.data.token);
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${AuthBack})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
        <Card className="w-full max-w-md border-none bg-white/95 shadow-2xl backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              {isSignup ? "Create an account" : "Welcome back"}
            </CardTitle>
            <p className="text-sm text-gray-500 text-center">
              {isSignup ? "Sign up to start tracking" : "Login to your dashboard"}
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            {error && (
              <div className="mb-4 p-3 rounded bg-red-100 border border-red-200 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>

              {isSignup && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</label>
                  <input
                    name="phonenumber"
                    type="text"
                    placeholder="e.g. 0712345678"
                    value={formData.phonenumber}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>

              {isSignup && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
              >
                {loading ? "Processing..." : isSignup ? "CREATE ACCOUNT" : "LOG IN"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                  setFormData({ username: "", password: "", confirmPassword: "", phonenumber: "" });
                }}
                className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span className="font-bold underline text-orange-500">
                  {isSignup ? "Login" : "Sign up"}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Auth;