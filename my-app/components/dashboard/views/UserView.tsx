// components/dashboard/views/UserView.tsx
"use client";
import { api } from "@/server/client";
import { useEffect, useState } from "react";

type Post = {
  id: number;
  description: string;
  imageData: string; // Matches API response
  imageMimeType: string;
  createdAt: Date; // Dates are usually strings when coming from JSON
};

export default function UserView() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    async function getPosts() {
      try {
        const { data, error } = await api.api.posts.get();

        if (error || !data?.success) {
          console.error("Something went wrong or unauthorized");
          return;
        }
        console.log("First Post Data:", data?.data?.[0]);
        // Cast the data to our Post type to fix the TS error from the image
        setPosts(data.data as Post[]);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    getPosts();
  }, []);

  if (isLoading)
    return (
      <p className="mt-3 ml-3 text-lg text-violet-600 animate-pulse">
        Fetching Media Feed...
      </p>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
        <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-widest">
          Media Feed (Read-Only)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="group p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:border-violet-500/50 transition-all overflow-hidden"
              >
                {/* Base64 Image Rendering */}
                <div className="aspect-video w-full mb-4 overflow-hidden rounded-xl bg-slate-900">
                  <img
                    /* Remove the template literal prefix and use the string directly */
                    src={post.imageData}
                    alt={post.description}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-200 font-medium line-clamp-1">
                      {post.description}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase">
                      ID: #00{post.id} •{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-1 rounded-md italic">
                    View Only
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">
              No media found in the feed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
