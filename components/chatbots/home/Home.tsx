"use client";
import ChatbotCardComponent from "./ChatbotCards";
import { H2 } from "@/components/common/Headings";
import CreateChatbotBtn from "../common/CreateChatbotBtn";
import { useEffect, useState } from "react";
import { ApiResponse } from "@/types/chatbot";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useDebounce } from "@/hooks/useDebounced";
import SearchBar from "../common/SearchBar";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import CustomDropdown from "../common/Dropdown";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const Home = () => {
  const [chatbots, setChatbots] = useState<ApiResponse | undefined>(undefined);
  const [fetchingChatbots, setFetchingChatbots] = useState<boolean>(true);
  const {data: session} = useSession()
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Search input state
  const itemsPerPage = 8;
  const router = useRouter()
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const signOutHandler = async () => {
    await signOut()
    router.push("/signin")
  }

  const getChatbots = async (page = currentPage, limit = itemsPerPage, search = searchTerm) => {
    setFetchingChatbots(true);
    try {
      const response = await fetch(`/api/chatbot-creator?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setChatbots(data);
    } catch (error) {
      console.error("Failed to fetch chatbots:", error);
    } finally {
      setFetchingChatbots(false);
    }
  };

  useEffect(() => {
    getChatbots();
  }, [currentPage, debouncedSearchTerm]); // Re-fetch when page or search changes

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>


      <div className="flex flex-col items-start py-[40px] w-full">

        <div className="flex justify-center items-center w-full pb-5 px-2">

          <CustomDropdown>
              <CreateChatbotBtn text={"Create a Chatbot"} style={"w-full text-left border-b-2 p-2"} />
            <DropdownMenuItem className="p-2 w-full ">
              <Link className="text-black w-full flex justify-start" href="/profile">Profile</Link>
            </DropdownMenuItem>
            <Button onClick={()=>signOutHandler()} className="flex items-center justify-center bg-redOrange w-full text-black font-bold rounded-none hover:bg-mintGreen    hover:text-white transition-all duration-100 shadow-2xl shadow-gray-800">Logout</Button>
          </CustomDropdown>
          <H2 text={`${session?.user.companyName} AI Workforce`} style="text-[30px]" />
        </div>

        <div className="w-full flex flex-col">
          <SearchBar inputPlaceholder={"Search by bot name, description..."} searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> {/* Use SearchBar */}
          {fetchingChatbots ?
            fetchingChatbots && <LoadingScreen />

            :
            <ChatbotCardComponent getChatbots={getChatbots} chatbots={chatbots} currentPage={currentPage} onPageChange={handlePageChange} />
          }
        </div>
      </div>

    </>
  );
};
