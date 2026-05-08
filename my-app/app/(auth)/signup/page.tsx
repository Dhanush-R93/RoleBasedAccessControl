"use client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/server/client";
const userSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name should be minimum 3 characters" })
    .max(20, { message: "Name should be Maximum 20 characters" }),
  password: z
    .string()
    .min(8, { message: "Password should be minimum 8 characters" })
    .max(30, { message: "Name should be Maximum 30 characters" }),
  email: z.string().email(),
  role: z.enum(["ADMIN", "EDITOR", "USER"]),
});
export default function SignupForm() {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "EDITOR" | "USER";
  }>({
    name: "",
    email: "",
    password: "",
    role: "USER", // Default role
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      success,
      data: formDataResult,
      error,
    } = userSchema.safeParse(formData);
    if (!success) {
      toast.error(error.issues[0].message, {
        position: "top-center",
        style: { color: "red" },
      });
      return;
    }
    try {
      console.log(formDataResult);

      const { data, error } = await api.api.auth.signup.post(formDataResult);

      if (error) {
        const errVal = error.value as { message?: string; error?: string };
        const message = errVal?.message || errVal?.error || "Signup failed";
        return toast.error(message, {
          position: "top-center",
          style: { color: "red" },
        });
      }

      toast.success(`Successfully Account created`, {
        position: "top-center",
        style: { color: "green" },
      });
    } catch (err) {
      toast.error("A network error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Background Glows */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md p-8 bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-slate-400 mt-2">Join the RBAC Media Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="Dhanush"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="dev@example.com"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Role
            </label>
            <select
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "ADMIN" | "EDITOR" | "USER",
                })
              }
            >
              <option value="USER">User</option>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-500/20 transform transition-active active:scale-[0.98]"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <a href="/signin" className="text-purple-400 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
