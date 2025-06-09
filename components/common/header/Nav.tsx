"use client";

import Link from "next/link";

const navLinks = [
    { href: "/about", label: "About" },
    { href: "/chatbots", label: "Chat Bot" },
    { href: "/services", label: "Services" },
];

export default function Nav({ isMenuOpen }: {isMenuOpen: boolean}) {
    return (
        <nav
            className={`${isMenuOpen ? "right-0" : "-right-full"
                } absolute -right-full top-0 w-full h-full z-10 px-3 bg-black p-0 md:bg-transparent 
                md:relative md:-right-0 md:px-0 md:w-[280px] md:flex md:justify-between md:items-center 
                transition-all duration-700 pt-16 md:pt-0`}
        >
            {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="flex w-full md:w-auto md:text-black text-white text-xl 
                    md:text-[16px] xl:text-xl px-2 py-2 md:p-0 hover:text-[#5DA389] 
                    font-bold transition-colors duration-300"
                >
                    {link.label}
                </Link>
            ))}
            <Link
                href="/dashboard"
                className="flex items-center justify-center md:hidden bg-redOrange mt-5 w-40 h-12
                        text-white text-[14px] xl:text-[16px] font-bold rounded-[36px] hover:bg-mintGreen 
                        hover:text-white transition-all duration-300 shadow-2xl shadow-gray-800"
            >
                Book A Call
            </Link>
        </nav>
    );
}
