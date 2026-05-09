"use client";
import { api } from "@/server/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Assuming your Eden client is imported here
// import { api } from "@/lib/api";

type Post = {
  id: number;
  description: string;
  imageData: string;
  imageMimeType: string;
  createdAt: Date;
};

export default function AdminView() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Posts on Load
  
 const fetchPosts = async () => {
    setIsLoading(true);
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
      toast.error("Failed to load posts");
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

  // 2. Helper: Convert File to Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 3. Create / Update Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return toast.error("Description is required");
    setIsSubmitting(true);

    try {
      let imageData = "";
      if (file) imageData = await convertToBase64(file);

      if (editMode && selectedId) {
         await api.api.posts({ id: selectedId }).patch({ description, imageData })
        toast.success("Post updated successfully");
      } else {
        await api.api.posts.post({ description, imageData, mimeType: file?.type as string })
        toast.success("Post created successfully");
      }
      fetchPosts();
      closeModal();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete Logic
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
       await api.api.posts({ id }).delete();
      toast.success("Post deleted");
      fetchPosts()
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const openEditModal = (post: Post) => {
    setEditMode(true);
    setSelectedId(post.id);
    setDescription(post.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setFile(null);
    setDescription("");
    setSelectedId(null);
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-slate-900/40 p-8 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl">
        <div>
          <h2 className="text-white font-black text-3xl tracking-tight">System Workspace</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Role: Administrator</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-purple-500/20 active:scale-95"
        >
          + CREATE NEW POST
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-slate-500 animate-pulse">Loading management console...</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden hover:border-slate-700 transition-all">
              {/* Image Preview */}
              <div className="aspect-video w-full bg-slate-950 overflow-hidden relative">
                <img 
                  src={post.imageData} 
                  alt={post.description} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-tighter">
                  ID: #{post.id}
                </div>
              </div>

              {/* Content & Actions */}
              <div className="p-6">
                <p className="text-white font-medium line-clamp-2 mb-6 h-12">{post.description}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => openEditModal(post)}
                    className="py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl font-bold text-xs transition-all border border-blue-600/20"
                  >
                    UPDATE
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl font-bold text-xs transition-all border border-red-600/20"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-2">
              {editMode ? "Edit Record" : "New Record"}
            </h3>
            <p className="text-slate-500 text-sm mb-8">Manage your database assets.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Media</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white hover:file:bg-slate-700 transition-all cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-purple-600 outline-none h-32 transition-all resize-none"
                  placeholder="Enter detailed description..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all">
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-white text-black rounded-2xl font-black hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "PROCESSING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}