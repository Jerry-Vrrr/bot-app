"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from 'lucide-react';
import { ApiResponse } from '@/types/chatbot';
import Pagination from '@/components/common/Pagination';
import Image from 'next/image';

interface ChatbotCardComponentProps {
  chatbots?: ApiResponse;
  getChatbots: (page?: number, limit?: number) => Promise<void>;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const ChatbotCardComponent = ({
  chatbots,
  getChatbots,
  currentPage,
  onPageChange,
}: ChatbotCardComponentProps) => {
  const copyChatbot = async (chatbotId: string) => {
    try {
      await fetch('/api/chatbot-creator/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId }),
      });
      await getChatbots(currentPage);
    } catch (error) {
      console.error('Failed to copy chatbot:', error);
    }
  };

  const deleteChatbot = async (chatbotId: string) => {
    try {
      await fetch(`/api/chatbot/${chatbotId}`, { method: 'DELETE' });
      await getChatbots(currentPage);
    } catch (error) {
      console.error('Failed to delete chatbot:', error);
    }
  };

  return (
    <>

      <h2 className="text-xl font-bold text-dark mb-4 mx-auto xl:mx-auto md:mx-7">Chatbots</h2>
      {(!chatbots?.data || chatbots.data.length === 0) ? (
        <div className="flex justify-center py-5 w-full">No Chatbot Data</div>
      ) : (
        <div className="mx-auto xl:mx-auto mt-5 md:mx-7  md:px-10 max-w-[1240px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 bg-[#C1F3E8] p-8 rounded-3xl">
          {chatbots.data.map((item) => (
            <div className=' pb-4' key={`${item.id}-chatbots-home`}>
              <div

                className="bg-white h-[300px] lg:h-[250px] relative rounded shadow-md hover:shadow-lg transition flex flex-col items-center text-center border-[10px] border-mintGreen"
              >
                <Link className='w-full h-full' href={`/chatbots/${item.id}`}>
                  <Image
                    src={item.chatbotPic || '/images/fallback-image.jpg'}
                    className='w-full h-full object-cover'
                    width={400}
                    height={400}
                    alt={item.chatbotName}
                  />
                </Link>
                <div className='absolute right-0'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className='hover:bg-transparent' variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='bg-white rounded z-40 flex flex-col items-start border-2 border-black' align="end">
                      <DropdownMenuItem className='cursor-pointer hover:bg-none w-full' onClick={() => copyChatbot(item.id)}>
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer w-full' onClick={() => deleteChatbot(item.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <span className='font-semibold flex pl-3 pt-2 text-lg'>{item.chatbotName}</span>
            </div>

          ))}
        </div>
      )}
      {chatbots?.pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={ chatbots.pagination.totalPages === 0 ? 1 :  chatbots.pagination.totalPages}
          onPageChange={onPageChange}
          totalItems={chatbots.pagination.totalItems}
          itemsPerPage={chatbots.pagination.itemsPerPage}
        />
      )}
    </>
  );
};

export default ChatbotCardComponent;