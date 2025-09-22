
"use client"
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/SupabaseClient";
import { Upload, Download, Smartphone, Laptop, CheckCircle, AlertCircle, LogOut, File, ArrowRight, Zap } from 'lucide-react';


export const MainPage=()=>{
  const [uploadedFilePath, setUploadedFilePath] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [login, setLogin] = useState(false);

  const router = useRouter();


 async function signOut() {
  try {
    await authClient.signOut();
    
   
    setLogin(false);
    
   
    router.push("/");
  } catch (error) {
    console.error("Sign out failed:", error);

    setLogin(false);
    router.push("/");
  }
}


  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setIsUploading(true);

    const input = document.getElementById("file") as HTMLInputElement;
    if (!input.files?.[0]) {
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", input.files[0]);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.filePath) setUploadedFilePath(data.filePath);
    setIsUploading(false);
  }

  async function handleDownload() {
    if (!uploadedFilePath) return;
    setIsDownloading(true);

    const res = await fetch("/api/download", {
      method: "POST",
      body: JSON.stringify({ filePath: uploadedFilePath }),
      headers: { "Content-Type": "application/json" },
    });

    const { url } = await res.json();
    if (!url) {
      setIsDownloading(false);
      return;
    }

    const blob = await (await fetch(url)).blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = uploadedFilePath.split("/").pop() || "downloaded-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setIsDownloading(false);
  }

  // Realtime subscription
  useEffect(() => {
    try {
      const channel = supabase
        .channel("file-transfers")
        .on("broadcast", { event: "file_uploaded" }, (payload) => {
          setUploadedFilePath(payload.payload.filePath);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up Supabase channel:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            File Transfer 
          </h1>
          <p className="text-gray-300 text-lg">Upload from one device, download from another</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              uploadedFilePath ? 'bg-green-500 border-green-500' : 'bg-blue-500 border-blue-500'
            }`}>
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className={`w-6 h-6 transition-colors duration-300 ${
                uploadedFilePath ? 'text-green-400 animate-pulse' : 'text-gray-400'
              }`} />
              <Zap className={`w-4 h-4 transition-colors duration-300 ${
                uploadedFilePath ? 'text-yellow-400 animate-bounce' : 'text-gray-400'
              }`} />
              <ArrowRight className={`w-6 h-6 transition-colors duration-300 ${
                uploadedFilePath ? 'text-green-400 animate-pulse' : 'text-gray-400'
              }`} />
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              uploadedFilePath ? 'bg-green-500 border-green-500' : 'bg-gray-600 border-gray-600'
            }`}>
              <Laptop className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Upload */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Upload File (Mobile)</h2>
                  <p className="text-gray-300 text-sm">From your mobile device</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type="file" 
                    id="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                  />
                  <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-white/5 transition-all duration-300 group-hover:border-white/50">
                    <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white/80 font-medium mb-2">
                      {fileName ? fileName : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-gray-400 text-sm">Supports any file type, up to 100MB</p>
                  </div>
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full group relative px-6 py-4 bg-gradient-to-r from-slate-900 via-orange-800 to-slate-900 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0  rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                </button>
              </div>

              {uploadedFilePath && (
                <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="text-green-300 font-medium">File uploaded successfully.</p>
                    <p className="text-green-400/80 text-sm">{fileName} is ready for download</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Download */}
          <div className="group">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  uploadedFilePath 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}>
                  <Laptop className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Download File (Laptop)</h2>
                  <p className="text-gray-300 text-sm">To your laptop/desktop</p>
                </div>
              </div>

              {!uploadedFilePath ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium mb-2">No file available</p>
                  <p className="text-gray-500 text-sm">Upload a file first to enable download</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <File className="w-8 h-8 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{fileName || 'File ready'}</p>
                        <p className="text-gray-400 text-sm">Ready for download</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={!uploadedFilePath || isDownloading}
                    className={`w-full group relative px-6 py-4 font-semibold rounded-xl text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      uploadedFilePath 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isDownloading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download
                        </>
                      )}
                    </span>
                    {uploadedFilePath && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    )}
                  </button>
                </div>
              )}

             
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-400 text-sm">
           <div className="mt-8 pt-6 border-t border-white/10">
                <button 
                  onClick={signOut} 
                  className="w-full px-4 py-3 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/30 text-white hover:text-red-300 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
          <p>Files are automatically deleted after 24 hours for security</p>
        </div>
      </div>
    </div>
  );
}