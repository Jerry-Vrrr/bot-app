import CopyRight from "./CopyRight";
import SocialMediaLinks from "./SocialMediaLinks";
import FooterLinksList from "./FooterLinksList";

export default function Footer() {
    return (
        <footer>
            <div className="flex flex-wrap justify-between items-center mx-3 xl:mx-auto mt-5 
            md:mx-7 py-5 px-5 md:px-10 mb-3 max-w-[1240px] rounded-[44px] bg-black"
            >
                <CopyRight />
                <SocialMediaLinks />
                <FooterLinksList />
            </div>
        </footer>
    )
}
