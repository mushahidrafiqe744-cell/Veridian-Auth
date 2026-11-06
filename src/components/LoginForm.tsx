import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Checkbox } from "./ui/Checkbox";
import { Toast } from "./ui/Toast";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

type AuthView = "login" | "signup" | "forgot-password";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [view, setView] = React.useState<AuthView>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; name?: string }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const validate = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (view !== "forgot-password") {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (view === "signup" && !name.trim()) {
      newErrors.name = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (view === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setToast({
            show: true,
            message: error.message || "Invalid email or password",
            type: "error",
          });
          setErrors({ email: error.message });
        } else {
          setToast({
            show: true,
            message: "Welcome back! Login successful.",
            type: "success",
          });
          if (onSuccess) onSuccess();
        }
      } else if (view === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          setToast({
            show: true,
            message: error.message || "Failed to create account",
            type: "error",
          });
        } else {
          if (data?.user && !data.session) {
            setToast({
              show: true,
              message: "Registration successful! Please check your email to verify your account.",
              type: "success",
            });
            setView("login");
          } else {
            setToast({
              show: true,
              message: "Account created successfully! Welcome to Veridian.",
              type: "success",
            });
            if (onSuccess) onSuccess();
          }
        }
      } else if (view === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });

        if (error) {
          setToast({
            show: true,
            message: error.message || "Could not send reset link",
            type: "error",
          });
        } else {
          setToast({
            show: true,
            message: "Password reset instructions sent to your email.",
            type: "success",
          });
          setView("login");
        }
      }
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.message || "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setToast({
          show: true,
          message: error.message || "Google sign-in could not be initiated",
          type: "error",
        });
      }
    } catch (err: any) {
      setToast({
        show: true,
        message: err?.message || "Google authentication failed",
        type: "error",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-10"
      >
        <AnimatePresence mode="wait">
          {view === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#16A34A] mb-6 shadow-lg shadow-[#16A34A]/20"
                >
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>
                <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Welcome back</h1>
                <p className="text-gray-500 mt-2 text-sm">Sign in to your account powered by Supabase</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#111827] ml-0.5">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setView("forgot-password")}
                      className="text-xs font-semibold text-[#16A34A] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    isPassword
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Checkbox 
                    label="Remember for 30 days" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Sign In
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-2 text-gray-400 font-medium">Or continue with</span>
                </div>
              </div>

              <Button 
                variant="google" 
                className="w-full" 
                onClick={handleGoogleLogin}
                isLoading={isGoogleLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <button 
                  onClick={() => setView("signup")}
                  className="font-semibold text-[#16A34A] hover:underline"
                >
                  Create account
                </button>
              </p>
            </motion.div>
          )}

          {view === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#16A34A] mb-6 shadow-lg shadow-[#16A34A]/20 text-white font-bold text-xl">
                  V
                </div>
                <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Create an account</h1>
                <p className="text-gray-500 mt-2 text-sm">Join Veridian with your Supabase credentials</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  autoComplete="name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  isPassword
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                />

                <p className="text-xs text-gray-500 text-center px-4 leading-relaxed">
                  By signing up, you agree to our{" "}
                  <button type="button" className="underline hover:text-gray-800">Terms</button> and{" "}
                  <button type="button" className="underline hover:text-gray-800">Privacy Policy</button>.
                </p>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Create Account
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button 
                  onClick={() => setView("login")}
                  className="font-semibold text-[#16A34A] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          )}

          {view === "forgot-password" && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <button 
                onClick={() => setView("login")}
                className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#16A34A] transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Login
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 mb-6 text-gray-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Forgot Password?</h1>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Enter your email address and Supabase will send a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Toast 
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
