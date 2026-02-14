import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import AuthBack from "../assets/Auth-Back.jpg";
import API from "../api";

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  
  // Define initial state to reuse for resetting
  const initialFormState = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phonenumber: "", 
    loginIdentifier: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to switch between Login and Signup and CLEAR form
  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setFormData(initialFormState); // This wipes the password and other fields
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, phonenumber, loginIdentifier } = formData;

    if (isSignup) {
      if (!username || !password || !email || !phonenumber || !confirmPassword) {
        return setError("All fields are required");
      }
      if (password !== confirmPassword) {
        return setError("Passwords do not match");
      }
    } else {
      if (!loginIdentifier || !password) {
        return setError("Please enter your Email/Phone and Password");
      }
    }

    try {
      setLoading(true);
      setError("");

      if (isSignup) {
        await API.post("/auth/register", {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          phonenumber: phonenumber.trim(),
        });

        alert("Account created successfully! Please login.");
        setIsSignup(false);
        setFormData(initialFormState); // Reset after successful registration
      } else {
        const res = await API.post("/auth/login", { 
          identifier: loginIdentifier.trim().toLowerCase(), 
          password 
        });
        
        localStorage.setItem("token", res.data.token);
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
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
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup ? (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Username</label>
                    <input name="username" type="text" value={formData.username} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black outline-none focus:ring-2 focus:ring-orange-500" placeholder="Username" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black outline-none focus:ring-2 focus:ring-orange-500" placeholder="name@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-gray-500">Phone Number</label>
                    <input name="phonenumber" type="text" value={formData.phonenumber} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black outline-none focus:ring-2 focus:ring-orange-500" placeholder="07XXXXXXXX" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Email or Phone Number</label>
                  <input
                    name="loginIdentifier"
                    type="text"
                    placeholder="Enter email or phone"
                    value={formData.loginIdentifier}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase text-gray-500">Password</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>

              {isSignup && (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Confirm Password</label>
                  <input name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              )}

              {error && <div className="mt-2 p-3 rounded bg-red-100 border border-red-200 text-red-600 text-sm font-medium">{error}</div>}

              <button type="submit" disabled={loading} className="w-full mt-2 py-3 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 text-center flex justify-center items-center">
                {loading ? "Processing..." : isSignup ? "CREATE ACCOUNT" : "LOG IN"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={toggleAuthMode} className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span className="font-bold underline text-orange-500">{isSignup ? "Login" : "Sign up"}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Auth;