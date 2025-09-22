"use client"
import { auth } from "@/lib/auth"
import { Upload, Download, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { authClient } from "@/lib/auth-client"
import {  signOut } from "better-auth/api"

import { redirect, useRouter } from "next/navigation"
import { useState } from "react";



export const HomeView=()=>{
   const [login,setLogin]=useState(false);
   const router=useRouter();
  

//  async function signOut() {
//     await authClient.signOut({
//       fetchOptions: {
//         onSuccess: () => {
//           router.push("/sign-in");
//           setLogin(true) // redirect to login page
//         },
//       },
//     });
//   }
    return(
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-white to-white relative overflow-hidden">
 
     

      
      <div className="flex flex-col justify-center items-center h-screen gap-8 relative z-10 px-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl max-w-4xl w-full text-center">
         
          <h1 className="text-4xl md:text-7xl font-bold bg-gradient-to-r from-black via-gray-700 to-orange-600 bg-clip-text text-transparent mb-6 leading-tight">
            Transfer files in 2 simple clicks
          </h1>
          
          <h4 className="text-xl md:text-2xl text-gray-900 mb-12 font-light">
            Upload from device 1 and download from device 2
          </h4>

        
          <div className="flex justify-center gap-8 mb-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-gray-300">Upload</span>
            </div>
            
            <div className="flex items-center">
              <ArrowRight className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-gray-300">Download</span>
            </div>
          </div>

    
          <div className="flex   gap-4 justify-center items-center">
            <button 
              onClick={() => redirect("/sign-up")} 
              className="group relative px-8 py-4 bg-gradient-to-r from-black via-gray-600 to-orange-800 text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <Zap className="w-5 h-5 group-hover:animate-bounce" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-black to-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>
            
            {/* {login && (
              <button 
                onClick={signOut}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-black font-medium rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                Sign Out
              </button>
            )} */}
          </div>

          <div className="flex justify-center gap-8 mt-12 text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm">Worldwide</span>
            </div>
          </div>
        </div>

      
        <button 
          onClick={() => setLogin(!login)}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          {login ? 'Demo: Logout' : 'Demo: Login'}
        </button>
      </div>

{/*       
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div> */}
    </div>
    )
}