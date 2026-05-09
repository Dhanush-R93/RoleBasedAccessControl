// app/dashboard/page.tsx
"use client";
import Sidebar from "../../components/dashboard/views/Sidebar";
import AdminView from "@/components/dashboard/views/AdminView";
import EditorView from "@/components/dashboard/views/EditorView";
import UserView from "@/components/dashboard/views/UserView";
import { api } from "@/server/client";
import { useEffect, useState } from "react";
export default function Dashboard() {
  const [user, setUser] = useState<{id:number,name:string,email:string,role:"ADMIN"|"EDITOR"|"USER" }|null>();
  const [loading,setLoading]=useState<boolean>(true);

  useEffect(() => {
    const getProfile = async () => {
     
      const { data, error } = await api.api.posts.me.get();

      if (error || !data?.authenticated) {
        console.error("Not authenticated");
        return;
      }
      setUser({
        role: data.user?.role as "ADMIN" | "EDITOR" | "USER",
        id: data.user?.id as number,
        name:data.user?.name as string,
        email:data.user?.email as string
      });
      setLoading(false);
    };

    getProfile();
  },[]);
 if(loading)
  return <p>Loading.....</p>
  return (
    <div className="flex bg-[#020617] min-h-screen">
      <Sidebar  user={user as {id:number,role:"ADMIN"|"EDITOR"|"USER",name:string,email:string }}/>

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            System Workspace
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Permission Level: {user!.role}
          </p>
        </header>

        {/* Strict Role Injection */}
        {user!.role === "ADMIN" && <AdminView />}
        {user!.role === "EDITOR" && <EditorView />}
        {user!.role === "USER" && <UserView />}
      </main>
    </div>
  );
}
