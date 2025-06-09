import AuthHeading from "@/components/authentication/Heading";
import Link from "next/link";


export default function Page() {
    return (
        <>
        <AuthHeading content={"Token Expired!"} />
            <p className='text-2xl max-w-[280px] mx-auto text-center'>
                    Your Token has expired. Please try the operation again!
                </p>
            <div className="space-y-6 pb-6 text-start">
                
                <div>
                <div className="flex justify-between items-center flex-col gap-x-5 mt-3">
                    <Link href={'signin'} className="text-black flex font-bold px-6 rounded-3xl text-md bg-redOrange hover:bg-[#f9301a]">
                        Login
                    </Link>
                </div>

                <div className="flex justify-center items-center">
                    <Link className="underline" href="/signup">Back to Login</Link>
                </div>
                </div>
            </div>
        </>
    );
}
