"use client";

import Image from "next/image";
import Link from "next/link";

const socialLinks = [
    {
        href: "https://www.facebook.com",
        icon: "/images/facebook.svg"
    },
    {
        href: "https://www.linkedin.com",
        icon: "/images/linkedin.svg"
    },
    {
        href: "https://www.instagram.com",
        icon: "/images/instagram.svg"
    },
    {
        href: "https://www.youtube.com",
        icon: "/images/youtube.svg"
    }
];

export default function SocialMediaLinks() {
    return (
        <div className="flex items-center justify-between w-48 my-4 md:my-0
         mx-auto text-center md:text-left md:mx-0">
            {socialLinks.map((item) => (
                <Link
                    key={`${item.href}-${Math.random()}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity duration-300"
                >
                    <Image
                        src={item.icon}
                        alt={item.href}
                        width={30}
                        height={30}
                        priority={true}
                    />
                </Link>
            ))}
        </div>
    );
}
