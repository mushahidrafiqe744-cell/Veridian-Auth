import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { type User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Toast } from "./ui/Toast";
import { 
  LogOut, 
  ShieldCheck, 
  User as UserIcon, 
  Mail, 
  Key, 
  Calendar,
  CheckCircle2,
  Copy,
  Code,
  Edit2,
  Save,
  X
} from "lucide-react";

interface UserDashboardProps {
  user: User;
  onSignOut: () => void;
}

export function UserDashboard({ user, onSignOut }: UserDashboardProps) {
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showSqlModal, setShowSqlModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [profileName, setProfileName] = React.useState("");
  const [profileBio, setProfileBio] = React.useState("");
  const [role, setRole] = React.useState("member");

  const [toast, setToast] = React.useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const defaultName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // Fetch profile from public.profiles table if exists
  React.useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, bio, role")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setProfileName(data.full_name || defaultName);
          setProfileBio(data.bio || "");
          if (data.role) setRole(data.role);
        } else {
          setProfileName(defaultName);
        }
      } catch {
        setProfileName(defaultName);
      }
    }

    loadProfile();
  }, [user.id]);

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: profileName.trim(),
          bio: profileBio.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        // If table doesn't exist yet, show friendly tip to run SQL
        if (error.code === "42P01") {
          setToast({
            show: true,
            message: "profiles table not found. Run the SQL script in Supabase first!",
            type: "error",
          });
        } else {
          setToast({ show: true, message: error.message, type: "error" });
        }
      } else {
        setToast({ show: true, message: "Profile updated in Supabase!", type: "success" });
        setIsEditing(false);
      }
    } catch (err: any) {
      setToast({ show: true, message: err?.message || "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profileName || defaultName;
  const userInitials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setIsSigningOut(false);
    if (error) {
      setToast({ show: true, message: error.message, type: "error" });
    } else {
      onSignOut();
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setToast({ show: true, message: "User ID copied to clipboard", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const copySqlSchema = () => {
    const sql = `-- Run this in Supabase Dashboard -> SQL Editor:
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

    navigator.clipboard.writeText(sql);
    setToast({ show: true, message: "SQL Schema copied to clipboard!", type: "success" });
  };

  const createdDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) 
    : "Recent";

  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Just now";

  return (
    <div className="w-full max-w-lg px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8 md:p-10"
      >
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[#16A34A]/25 shrink-0">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#111827]">{displayName}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full capitalize">
                  <CheckCircle2 className="w-3 h-3" />
                  {role}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            title="Edit Profile"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Editable Profile Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="py-4 border-b border-gray-100 space-y-3 overflow-hidden"
            >
              <Input
                label="Display Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Full Name"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#111827] ml-0.5">Bio</label>
                <textarea
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10 outline-none transition-all"
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  className="h-9 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  isLoading={isSaving}
                  className="h-9 px-4 text-xs"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supabase Connection Banner */}
        <div className="my-5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#16A34A]"></div>
            <div>
              <span className="font-semibold">Supabase Connected</span>
              <span className="text-emerald-700 block text-[11px]">thargrxgvnkswblezchd.supabase.co</span>
            </div>
          </div>
          <button
            onClick={copySqlSchema}
            className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-emerald-800 text-[11px] font-medium border border-emerald-200/80 shadow-xs flex items-center gap-1 transition-colors"
          >
            <Code className="w-3 h-3 text-[#16A34A]" />
            Copy SQL
          </button>
        </div>

        {/* Account Details Cards */}
        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-[11px] text-gray-400 block font-medium uppercase tracking-wider">User UID</span>
                <span className="text-xs font-mono text-gray-700 truncate max-w-[200px] md:max-w-[240px] block">
                  {user.id}
                </span>
              </div>
            </div>
            <button 
              onClick={copyUserId}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              title="Copy User ID"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member Since</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">{createdDate}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Last Signed In</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">{lastSignIn}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2.5">
          <Button
            variant="secondary"
            onClick={handleSignOut}
            isLoading={isSigningOut}
            className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Veridian
          </Button>
        </div>
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
