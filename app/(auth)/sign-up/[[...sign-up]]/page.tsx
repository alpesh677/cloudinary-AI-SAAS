"use client"
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { EmailAddress } from "@clerk/nextjs/server";
import SignupForm from "@/components/SignupForm";
import VerifyForm from "@/components/VerifyForm";

export default function Page() {
    return <SignUp />;
}


// export default function Page() {

//     const { isLoaded, setActive, signUp } = useSignUp();
//     const [clerkError, setClerkError] = useState("")
//     const router = useRouter();
//     const [isverifying, setIsverifying] = useState(false)
//     const [code, setCode] = useState("")
//     const [error, setError] = useState("")

//     const signUpWithEmail = async ({ emailAddress, password }: { emailAddress: string, password: string }) => {
//         if (!isLoaded) {
//             return;
//         }

//         try {
//             await signUp.create({
//                 emailAddress,
//                 password,
//             });
//             await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
//             setIsverifying(true);
//         } catch (err: any) {
//             setClerkError(err.errors[0].message);
//         }
//     };

//     const handleVerify = async (e: FormEvent) => {
//         e.preventDefault();
//         if (!isLoaded)
//             return;

//         try {
//             const completeSignUp = await signUp.attemptEmailAddressVerification({ code })

//             if (completeSignUp.status !== "complete") {
//                 console.log(JSON.stringify(completeSignUp, null, 2));
//             }

//             if (completeSignUp.status === "complete") {
//                 await setActive({ session: completeSignUp.createdSessionId });
//                 router.push("/home");
//             }
//         } catch (error) {
//             console.log("Error:", JSON.stringify(error, null, 2));
//         }
//     }

//     const handleGoogleSignUp = async () => {
//         try {
//             if (signUp) {
//                 await signUp.authenticateWithRedirect({
//                     strategy: "oauth_google",
//                     redirectUrl: "/",
//                     redirectUrlComplete: "/home",
//                 });
//             } else {
//                 setError("Sign-up process is not available at this time.");
//             }
//         } catch (err) {
//             setError("Failed to sign up with Google. Please try again.");
//         }
//     };

//     return (
//         <>

//             {!isverifying ?
//                 (<SignupForm signUpWithEmail={signUpWithEmail} clerkError={clerkError} />) :
//                 (<VerifyForm handleVerify={handleVerify} code={code} setCode={setCode} />)
//             }

//         </>
//     )
// }
