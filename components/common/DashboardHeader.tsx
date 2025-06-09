"use client"

import { signOut } from "next-auth/react"
import { Button } from '../ui/button'
import Link from "next/link"

const DashboardHeader = () => {
 
  return (
    <div className="shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] flex justify-between items-center px-6 py-4 bg-white mt-4 mx-4 rounded-full"> 
      <span><Link href="/" className='font-semibold'>AION</Link></span>
      <div>
        <Button onClick={() => signOut({callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/signin`})}>Sign out</Button>
      </div>
    </div>
  )
}

export default DashboardHeader
