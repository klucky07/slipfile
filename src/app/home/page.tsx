import { session } from "@/db/schema";
import { redirect } from "next/navigation";



 const Page=()=>{
    // if(!!session){
    //     redirect("/sign-up")
    // }
    return(
        <div>
            <p>home</p>
            <input type="file" /><input type="file" />
        </div>
    )

}

export default Page;