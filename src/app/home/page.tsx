import { auth } from "@/lib/auth";

import { MainPage } from "@/modules/mainpage/MainPage";

import { headers } from "next/headers";
import { redirect } from "next/navigation";




const Page =async()=> {
   
 const session = await auth.api.getSession({
    headers:await headers(),
});
if(!session){
    redirect("/sign-in")
  
    
}

  return (
    
 <MainPage />
  
   
  )
}
export default Page;