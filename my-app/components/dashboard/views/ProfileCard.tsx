// components/dashboard/ProfileCard.tsx
import { api } from "@/server/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface ProfileCardProps {
  user: { id: number; name: string; email: string; role: string };
  onClose: () => void;
}

export default function ProfileCard({ user, onClose }: ProfileCardProps) {
    const router = useRouter();
  const handleLogout = async () => {
    try {
      // 1. Call the backend to clear the HttpOnly cookie
      const { error } = await api.api.auth.logout.post()

      if (error) throw new Error("Logout failed");

      // 2. Success feedback
      toast.success("Successfully logged out");

      // 3. Force redirect to signin
      router.push("/signin");
      router.refresh(); // Clears any cached layout data
    } catch (err) {
      toast.error("Could not log out. Try again.");
    }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center">
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <h3 className="text-2xl font-bold text-white">{user.name}</h3>
          <span className="px-3 py-1 bg-slate-800 text-purple-400 text-[10px] font-bold rounded-full mt-2 uppercase tracking-widest border border-purple-500/20">
            {user.role}
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Email Address
            </p>
            <p className="text-slate-200 text-sm">{user.email}</p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              User ID
            </p>
            <p className="text-slate-200 text-sm font-mono">#000{user.id}</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95"
          >
            LogOut
          </button>
        </div>
      </div>
    </div>
  );
}
