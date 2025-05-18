'use client'

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Utility function to handle API requests with token

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Optionally, validate the token with a backend endpoint
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token and user data
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Store user data (excluding sensitive information)
      if (data.admin) {
        localStorage.setItem('user', JSON.stringify({
          id: data.admin._id,
          email: data.admin.email,
          name: data.admin.name,
          role: data.admin.role
        }));
      }
      
      toast.success("Login successful", {
        description: "You have been logged in successfully.",
      });
      
      // Redirect to dashboard or home page
      router.push("/admin");
      
    } catch (error) {
      setError(error.message);
      toast.error("Login failed", {
        description: error.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add logout utility function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push("/login");
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-1.5">
          <h3 className="text-lg font-semibold">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter your credentials to access your account</p>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
            <input
              id="email"
              type="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="your.email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border-0 hover:bg-accent hover:text-accent-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col p-6 pt-0">
          <button 
            type="submit" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Sign In"
            )}
          </button>
          <div className="mt-4 text-center text-sm">
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="mt-2 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
            <a href="/signup" className="text-primary hover:underline">
              Sign Up
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;