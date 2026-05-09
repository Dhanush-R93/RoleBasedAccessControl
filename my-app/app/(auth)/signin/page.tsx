"use client";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/server/client";
import { useRouter } from "next/navigation";
const userSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password should be minimum 8 characters" })
    .max(30, { message: "Name should be Maximum 30 characters" }),
});
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
 const router=useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {success,data:formDataResult,error}=userSchema.safeParse(formData);
       if (!success) {
             toast.error(error.issues[0].message, {
               position: "top-center",
               style: { color: "red" },
             });
             return;
           }
           try {
             console.log(formDataResult);
       
             const { data, error } = await api.api.auth.login.post(formDataResult);
       
             if (error) {
               const errVal = error.value as { message?: string; error?: string };
               const message = errVal?.message || errVal?.error || "Signup failed";
               return toast.error(message, {
                 position: "top-center",
                 style: { color: "red" },
               });
             }
             console.log(data);
             router.push("/dashboard")
             toast.success(`Successfully Loggined`, {
               position: "top-center",
               style: { color: "green" },
             });
           } catch (err) {
             toast.error("A network error occurred");
           }
     
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>

      <div className="relative w-full max-w-md">
        {/* Decorative element */}
        <div className="absolute -top-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[1px] w-full opacity-50"></div>

        <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-400 mt-3 text-sm">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-purple-400">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="name@company.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider transition-colors group-focus-within:text-purple-400">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-tighter"
                >
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-slate-700"
                placeholder="••••••••"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-400 select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-purple-500/20 transform transition-active active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Donot have an account?{" "}
              <a
                href="/signup"
                className="text-white font-semibold hover:underline underline-offset-4"
              >
                Sign up for free
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
