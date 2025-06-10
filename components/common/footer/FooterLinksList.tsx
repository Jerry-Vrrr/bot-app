import Link from "next/link";

const footerLinks = [
    {
        href: "https://www.facebook.com",
        title: "Privacy"
    },
    {
        href: "https://www.facebook.com",
        title: "Terms & Condition"
    },

];

export default function FooterLinksList() {
    return (
        <ul className="grid-cols-2 space-x-4 mx-auto text-center md:text-left md:mx-0">
            {footerLinks.map((item) => (
                <Link
                    key={`${item.href}-${Math.random()}`}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mintGreen text-[16px] hover:text-white duration-300 transition"
                >
                    {item.title}
                </Link>
            ))}
        </ul>
    )
}
