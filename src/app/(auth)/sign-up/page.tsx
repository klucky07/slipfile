import { auth } from "@/lib/auth"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { SignUpView } from "@/modules/auth/SignUpView"



const Page= async()=>{
  const session =await auth.api.getSession({
headers:await headers(),
  })
  if(!!session){
   redirect("/home")
  }
  return <SignUpView/>
}
export default Page;