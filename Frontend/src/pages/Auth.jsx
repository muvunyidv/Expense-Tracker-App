import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChevronDown, ShieldCheck } from "lucide-react"; // Added icons
import AuthBack from "../assets/Auth-Back.jpg";
import API from "../api";

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  
  const initialFormState = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phonenumber: "", 
    loginIdentifier: "",
    role: "staff", // Default role
    accessCode: ""  // For Manager verification
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, phonenumber, loginIdentifier, role, accessCode } = formData;

    if (isSignup) {
      if (!username || !password || !email || !phonenumber || !confirmPassword) {
        return setError("All fields are required");
      }
      if (password !== confirmPassword) {
        return setError("Passwords do not match");
      }
      // Simple security: if they choose manager, they need a code
      if (role === "manager" && accessCode !== "BOSS2026") {
        return setError("Invalid Manager Access Code");
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
        const res = await API.post("/auth/register", {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          phonenumber: phonenumber.trim(),
          role: role // Send role to backend
        });

        const token = res.data.token;
        if (token) {
          localStorage.setItem("token", token);
          onLogin(); 
        }
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
        <Card className="w-full max-w-md border-none bg-white/95 shadow-2xl backdrop-blur-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-2 pt-8">
            <CardTitle className="text-2xl font-black text-center text-gray-900 uppercase tracking-tight">
              {isSignup ? "Join the Team" : "Welcome back"}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Username</label>
                      <input name="username" type="text" value={formData.username} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-black outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="John" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Phone</label>
                      <input name="phonenumber" type="text" value={formData.phonenumber} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-black outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="078..." />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-black outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="name@example.com" />
                  </div>

                  {/* ROLE SELECTION */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-1">I am a...</label>
                      <div className="relative">
                        <select 
                          name="role" 
                          value={formData.role} 
                          onChange={handleChange}
                          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-black outline-none focus:ring-2 focus:ring-orange-500 appearance-none transition-all"
                        >
                          <option value="staff">Staff Member</option>
                          <option value="manager">Manager</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {formData.role === "manager" && (
                      <div className="animate-in slide-in-from-left-2 duration-300">
                        <label className="text-[10px] font-black uppercase text-orange-600 ml-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Access Code
                        </label>
                        <input 
                          name="accessCode" 
                          type="password" 
                          value={formData.accessCode} 
                          onChange={handleChange} 
                          className="w-full mt-1 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-black outline-none focus:ring-2 focus:ring-orange-500" 
                          placeholder="Code" 
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Email or Phone Number</label>
                  <input
                    name="loginIdentifier"
                    type="text"
                    placeholder="Enter email or phone"
                    value={formData.loginIdentifier}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Password</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                />
              </div>

              {isSignup && (
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Confirm Password</label>
                  <input name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-black focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
              )}

              {error && (
                <div className="mt-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-600" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full mt-4 py-4 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all disabled:opacity-50 tracking-widest">
                {loading ? "PROCESSING..." : isSignup ? "CREATE ACCOUNT" : "LOG IN"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button onClick={toggleAuthMode} className="text-xs text-gray-500 hover:text-orange-500 transition-colors tracking-wide">
                {isSignup ? "ALREADY HAVE AN ACCOUNT? " : "DON'T HAVE AN ACCOUNT? "}
                <span className="font-black text-orange-500 ml-1">{isSignup ? "LOGIN" : "SIGN UP"}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Auth;