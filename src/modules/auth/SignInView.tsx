"use client"

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGithub, FaGoogle } from "react-icons/fa"

export const SignInView=()=>{
     const router =useRouter();
    const[error,setError]=useState<string | null>(null);
    const[pending,setPending]=useState(false)
     const onSocial =(provider:"google" | "github") =>{
        setError(null);
        setPending(true)

        authClient.signIn.social(
            { provider:provider,
                callbackURL:"/home/"
            },{
            onSuccess:()=>{
                setPending(false)
                router.push('/home/')
                
               
            },
            onError:({error})=>{
                setPending(false)
                setError(error.message)
            }}
        )

    }
    return(
        <div className="w-full  flex items-center  justify-center gap-2 pt-20">
             <button onClick={()=>onSocial("google")}>
                            <FaGoogle/>
                        </button>
                        <button onClick={()=>onSocial("github")}>
                            <FaGithub/>
                        </button>
        </div>
    )
}