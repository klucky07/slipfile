"use client"
import { authClient } from "@/lib/auth-client"
import {  signOut } from "better-auth/api"
import { redirect, useRouter } from "next/navigation"


export const HomeView=()=>{
  const router=useRouter();
 async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in"); // redirect to login page
        },
      },
    });
  }
    return(
        <div className="flex flex-col  justify-center items-center ">
      <h1>Transfer files in 2 simple clickc</h1>
      <h4>Upload from device 1 and download from device 2</h4>
      <button onClick={()=>{
        redirect("/sign-up")
      }} className="bg-red-200"> get started </button>
      <button onClick={signOut}>
sign out
      </button>
     
    </div>
    )
}