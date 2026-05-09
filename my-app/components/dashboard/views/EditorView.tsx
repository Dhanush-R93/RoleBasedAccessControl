"use client";
import { api } from "@/server/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// import { api } from "@/lib/api";

type Post = {
  id: number;
  description: string;
  imageData: string;
  imageMimeType: string;
  createdAt: Date;
};

export default function EditorView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Posts (Read Rights)
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
       const { data } = await api.api.posts.get();
       if (data?.success) setPosts(data.data as Post[]);
    } catch (err) {
      toast.error("Failed to load records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function getData()
    {
     await fetchPosts()
    }
    getData()
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 2. Update Logic (No Create Logic here)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return toast.error("Description is required");
    setIsSubmitting(true);

    try {
      let imageData = "";
      if (file) imageData = await convertToBase64(file);

      // Only Patch/Update logic allowed
      if (selectedId) {
         await api.api.posts({ id: selectedId }).patch({ description, imageData });
        toast.success("Record updated successfully");
      }
      fetchPosts();
      closeModal();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (post: Post) => {
    setSelectedId(post.id);
    setDescription(post.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setDescription("");
    setSelectedId(null);
  };

  return (
    <div className="space-y-8 p-4 ">
      {/* Header Section - CREATE button removed */}
      <div className="flex justify-between items-center bg-slate-900/40 p-8 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl">
        <div>
          <h2 className="text-white font-black text-3xl tracking-tight">System Workspace</h2>
          <p className="text-amber-500 text-xs mt-1 uppercase tracking-widest font-bold">Editor: Read & Update Only</p>
        </div>
        {/* No Create Button here anymore */}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-slate-500 animate-pulse">Fetching records...</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-slate-700 transition-all">
              <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                <img 
                  src={post.imageData} 
                  alt={post.description} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <p className="text-white font-medium line-clamp-2 mb-6 h-12">{post.description}</p>
                
                {/* Only Update Button Available */}
                <button 
                  onClick={() => openEditModal(post)}
                  className="w-full py-3 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white rounded-xl font-bold text-xs transition-all border border-amber-600/20"
                >
                  UPDATE RECORD
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update-Only Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6">Modify Existing Record</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Replace Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-600 outline-none h-32 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-2xl font-bold">
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-amber-600 text-white rounded-2xl font-black disabled:opacity-50"
                >
                  {isSubmitting ? "UPDATING..." : "SAVE UPDATES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}