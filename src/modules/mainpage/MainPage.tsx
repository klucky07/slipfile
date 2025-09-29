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
  const [downloadStatus, setDownloadStatus] = useState(""); // New state for download status
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
    setDownloadStatus(""); // Clear any previous download status

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
    setDownloadStatus("Preparing download...");

    try {
      // Get the signed URL for download
      const res = await fetch("/api/download", {
        method: "POST",
        body: JSON.stringify({ filePath: uploadedFilePath }),
        headers: { "Content-Type": "application/json" },
      });

      const { url } = await res.json();
      if (!url) {
        setIsDownloading(false);
        setDownloadStatus("");
        return;
      }

      setDownloadStatus("Downloading file...");

      // Start downloading the file
      const downloadResponse = await fetch(url);
      if (!downloadResponse.ok) {
        throw new Error('Download failed');
      }

      const blob = await downloadResponse.blob();
      
      setDownloadStatus("Saving file...");

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = uploadedFilePath.split("/").pop() || "downloaded-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setDownloadStatus("Cleaning up...");

      // Only after successful download, delete the file from storage
      const currentFilePath = uploadedFilePath; // Store it before state changes
      await fetch("/api/delete-file", {
        method: "POST",
        body: JSON.stringify({ filePath: currentFilePath }),
        headers: { "Content-Type": "application/json" },
      });

      // Clear the UI state after successful download and deletion
      setUploadedFilePath("");
      setFileName("");
      setDownloadStatus("");
      
      // Reset file input
      const input = document.getElementById("file") as HTMLInputElement;
      if (input) input.value = "";
      
    } catch (error) {
      console.error("Download error:", error);
      setDownloadStatus("Download failed. Please try again.");
      setTimeout(() => setDownloadStatus(""), 3000); // Clear error message after 3 seconds
      // Don't clear the UI if download failed - user can retry
    } finally {
      setIsDownloading(false);
    }
  }

  // Realtime subscription
  useEffect(() => {
    try {
      const channel = supabase
        .channel("file-transfers")
        .on("broadcast", { event: "file_uploaded" }, (payload) => {
          setUploadedFilePath(payload.payload.filePath);
        })
        .on("broadcast", { event: "file_downloaded_deleted" }, (payload) => {
          // Reset UI when file is downloaded and deleted
          setUploadedFilePath("");
          setFileName("");
          
          // Reset file input
          const input = document.getElementById("file") as HTMLInputElement;
          if (input) input.value = "";
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-white to-white  p-4">
      <div className="max-w-6xl mx-auto">
       
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-black via-gray-700 to-orange-600 bg-clip-text text-transparent mb-4">
            File Transfer 
          </h1>
          <p className=" text-lg bg-gradient-to-r from-black via-gray-700 to-orange-600 bg-clip-text text-transparent">Upload from one device, download from another</p>
        </div>

      
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              uploadedFilePath ? 'bg-green-500 border-green-500' : 'bg-blue-500 border-blue-500'
            }`}>
              <Smartphone className="w-6 h-6 text-black" />
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
              <Laptop className="w-6 h-6 text-gray-200" />
            </div>
          </div>
        </div>

       
        <div className="grid md:grid-cols-2 gap-8 mb-8">
         
          <div className="group">
            <div className="bg-white/10 backdrop-blur-lg border border-black/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">Upload File (Mobile)</h2>
                  <p className="text-gray-800 text-sm">From your mobile device</p>
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
                  <div className="border-2 border-dashed border-black/30 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-black/5 transition-all duration-300 group-hover:border-black/50">
                    <Upload className="w-12 h-12 text-black/60 mx-auto mb-4" />
                    <p className="text-black/80 font-medium mb-2">
                      {fileName ? fileName : 'Drop files here or click to browse'}
                    </p>
                    <p className="text-gray-400 text-sm">Supports any file type, up to 100MB</p>
                  </div>
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full group relative px-6 py-4 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 text-black font-semibold rounded-xl text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
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

       
          <div className="group">
            <div className="bg-white/10 backdrop-blur-lg border border-black/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  uploadedFilePath 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}>
                  <Laptop className="w-6 h-6 text-gray-200" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">Download File (Laptop)</h2>
                  <p className="text-gray-800 text-sm">To your laptop/desktop</p>
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
                  <div className="p-4 bg-black/5 rounded-xl border border-black/10">
                    <div className="flex items-center gap-3">
                      <File className="w-8 h-8 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-black font-medium">{fileName || 'File ready'}</p>
                        <p className="text-gray-400 text-sm">Ready for download</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={!uploadedFilePath || isDownloading}
                    className={`w-full group relative px-6 py-4 font-semibold rounded-xl text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      uploadedFilePath 
                        ? 'bg-gradient-to-r from-green-300 to-emerald-400 text-black' 
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isDownloading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          {downloadStatus || "Downloading..."}
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download
                        </>
                      )}
                    </span>
                    {uploadedFilePath && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    )}
                  </button>

                  {downloadStatus && !isDownloading && downloadStatus.includes("failed") && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                      <p className="text-red-300 text-sm text-center">{downloadStatus}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm">
           <div className="mt-8 pt-6 border-t border-black/10">
                <button 
                  onClick={signOut} 
                  className="w-full px-4 py-3 bg-black/10 hover:bg-orange-300/20 border border-black/20 hover:border-red-500/30 text-black hover:text-red-300 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
          <p>Files are automatically deleted after download for security</p>
        </div>
      </div>
    </div>
  );
}