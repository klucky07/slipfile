import { auth } from "@/lib/auth"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { SignInView } from "@/modules/auth/SignInView"


const Page= async()=>{
  const session =await auth.api.getSession({
headers:await headers(),
  })
  if(!!session){
   redirect("/")
  }
  return <SignInView/>
}
export default Page;