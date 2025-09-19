"use client"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import {  signOut } from "better-auth/api"

import { redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"


export const HomeView=()=>{
   const [login,setLogin]=useState(false);
   const router=useRouter();
  useEffect(() => {
    // fetch session on client
    const checkSession = async () => {
      const session = await authClient.getSession()
      if (session) setLogin(true)
    }
    checkSession()
  }, [])
   
 async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          setLogin(false) // redirect to login page
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
      {login && <button onClick={signOut}>
sign out
      </button> }
     
    </div>
    )
}