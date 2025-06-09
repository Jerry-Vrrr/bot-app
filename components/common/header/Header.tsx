"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "./Nav";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header>
            <div className="flex justify-between items-center mx-auto xl:mx-auto mt-5 md:mx-7 py-3 px-5
            md:px-10 max-w-[1240px] rounded-[36px] md:bg-white"
            >      
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <Image
                            src="/images/AiON (1).svg"
                            alt="logo"
                            width={145}
                            height={44}
                            priority={true}
                            className="w-36 h-11"
                        />
                    </Link>
                </div>

                {/* Desktop Navigation (Visible on md+) */}
                <nav className="hidden md:flex space-x-6">
                    <Nav isMenuOpen={false} />
                </nav>

                {/* Desktop "Book A Call" Button */}
                <div className="hidden md:flex">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center bg-redOrange w-40 h-12
                        text-black text-[14px] xl:text-[16px] font-bold rounded-[36px] hover:bg-mintGreen 
                        hover:text-white transition-all duration-300 shadow-2xl shadow-gray-800"
                    >
                        Book A Call
                    </Link>
                </div>

                {/* Mobile Menu Button (Hamburger Icon) */}
                <button 
                    onClick={() => setIsMenuOpen(true)} 
                    className="md:hidden z-50 focus:outline-none"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        className="w-6 h-6"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M4 6h16M4 12h16m-7 6h7" 
                        />
                    </svg>
                </button>

                {/* Background Overlay (Closes on Click) */}
                <div 
                    className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 
                    ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    onClick={() => setIsMenuOpen(false)}
                ></div>

                {/* Mobile Sliding Navigation Menu */}
                <div 
                    className={`fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 transform 
                    transition-transform duration-300 md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                    {/* Close Button (X) */}
                    <button 
                        onClick={() => setIsMenuOpen(false)} 
                        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            className="w-6 h-6 relative z-20"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M6 18L18 6M6 6l12 12" 
                            />
                        </svg>
                    </button>

                    {/* Mobile Navigation Links */}
                    <div className="mt-16 p-5">
                        <Nav isMenuOpen={isMenuOpen} />
                    </div>
                </div>
            </div>
        </header>
    );
}
