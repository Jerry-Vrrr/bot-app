'use client'
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const {data, status} = useSession()
  useEffect(()=>{
    console.log(data, status)
    
  }, [data, status])
  return (
    <div className="flex justify-center items-center  bg-mintGreen">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-[#1f0b2e] text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Username */}
          <div>
            <Label htmlFor="username" className="text-[#1f0b2e]">Username</Label>
            <Input id="username" placeholder="Your username" className="bg-gray-100 focus:ring-mintGreen" />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[#1f0b2e]">Email</Label>
            <Input id="email" type="email" placeholder="Your email" className="bg-gray-100 focus:ring-mintGreen" />
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="company" className="text-[#1f0b2e]">Company Name</Label>
            <Input id="company" placeholder="Your company name" className="bg-gray-100 focus:ring-mintGreen" />
          </div>

          {/* Save Button */}
          <Button className="w-full bg-redOrange text-white hover:bg-[#e04c3b]">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
