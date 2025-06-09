import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] px-6 py-4 mb-4 mx-4 rounded-full bg-black flex justify-between items-center'>
      <Link href={"/"} className='text-mintGreen'>Copyright c 2025 AION</Link>
      <ul className='flex gap-2'>
        <li><Link href={"#"}><Facebook color='#16d1a6'/></Link></li>
        
        <li><Link href={"#"}><Linkedin color='#16d1a6' /></Link></li>

        
        <li><Link href={"#"}><Youtube color='#16d1a6' /></Link></li>

        
        <li><Link href={"#"}><Twitter color='#16d1a6' /></Link></li>

        
        <li><Link href={"#"}><Instagram color='#16d1a6' /></Link></li>
      </ul>
      <div className='flex gap-4'>
      <Link href={"/"} className='text-mintGreen'>Privacy</Link>
      <Link href={"/"} className='text-mintGreen'>Terms & Conditions</Link>
      </div>
    </div>
  )
}

export default Footer
