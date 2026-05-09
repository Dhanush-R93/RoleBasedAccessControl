// components/dashboard/Sidebar.tsx
import { useState } from "react";
import ProfileCard from "./ProfileCard"; // Import the new component

const MENU_ITEMS = [
  { label: "Overview", icon: "📊", roles: ["ADMIN", "EDITOR", "USER"], href: "/dashboard" },
  { label: "Admin Panel", icon: "🛡️", roles: ["ADMIN"], href: "/dashboard/admin" },
  { label: "Media Manager", icon: "📁", roles: ["ADMIN", "EDITOR"], href: "/dashboard/media" },
  { label: "My Profile", icon: "👤", roles: ["ADMIN", "EDITOR", "USER"], href: "#" }, // Set to #
];

export default function Sidebar({ user }: { user: { role: string, id: number, name: string, email: string } }) {
  const [isProfileClicked, setIsProfileClicked] = useState<boolean>(false);

  return (
    <>
      <aside className="w-64 h-screen border-r border-slate-800 bg-slate-950 p-6 flex flex-col">
        <div className="mb-10 font-bold text-xl text-white tracking-tighter">MEDIA.RBAC</div>
        
        <nav className="flex-1 space-y-1">
          {MENU_ITEMS.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "My Profile") setIsProfileClicked(true);
                else window.location.href = item.href;
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all text-left"
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Mini-Profile at bottom */}
        <div className="pt-6 border-t border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* 3. Conditional Rendering of the Overlay Component */}
      {isProfileClicked && (
        <ProfileCard 
          user={user} 
          onClose={() => setIsProfileClicked(false)} 
        />
      )}
    </>
  );
}