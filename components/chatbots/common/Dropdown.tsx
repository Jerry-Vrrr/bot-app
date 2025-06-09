import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";

const CustomDropdown = ({ children }: { children: React.ReactNode }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="hover:bg-transparent" variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white rounded z-40 flex flex-col items-start border-2 border-black">{children}</DropdownMenuContent>
        </DropdownMenu>
    );
};
export default CustomDropdown