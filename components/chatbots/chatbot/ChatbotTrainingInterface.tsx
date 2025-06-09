"use client"
import React, { useCallback, useEffect, useState } from 'react'
import Header from './Header';
import { chatbotCreaterBase, TrainingData } from '@/types/chatbot';
import ChatbotTrainerBtn from './ChatbotTrainerBtn';
import TableComponent from './Table';
import LoadingScreen from '@/components/common/LoadingScreen';
import dynamic from 'next/dynamic';
import { useDebounce } from '@/hooks/useDebounced';
import SearchBar from '../common/SearchBar';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
const IntegrateChatbotBtn = dynamic(
  () => import('../common/IntegrateChatbotBtn'),
  { ssr: false, loading: () => <div>Loading...</div> }
);
const PublishedBtn = dynamic(
  () => import('@/components/common/PublishedBtn'),
  { ssr: false, loading: () => <div>Loading...</div> }
);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export const ChatbotTrainingInterface = ({ chatbotId }: { chatbotId: string }) => {

  const [fetchingChatbots, setFetchingChatbots] = useState<boolean>(true)
  const [chatbot, setChatbot] = useState<chatbotCreaterBase | null>(null)
  const [trainings, setTrainings] = useState<TrainingData[] | null>()
  const [fetchingTrainings, setFetchingTrainings] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10
  })
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading...')
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const router = useRouter();

  const getChatbotInfo = async () => {

    setFetchingChatbots(true)
    try {
      const response = await fetch(`${baseUrl}/api/chatbot-creator/${chatbotId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        if (!response.ok) {
          if (response.status === 400 || response.status === 404) {
            router.push("/not-found"); 
            return null;
          }
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

      }

      const data = await response.json();
      setChatbot(data.data)
      setFetchingChatbots(false)
      return data;
    } catch (error) {
      console.error("Error fetching chatbot:", error);
      setFetchingChatbots(false)
      return null;
    }
  };


  const getTrainings = useCallback(async (page = 1, limit = 10, search = debouncedSearchTerm) => {
    setFetchingTrainings(true);
    try {
      const response = await fetch(
        `/api/chatbot-creator/training/${chatbotId}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        { method: "GET" }
      );
      const data = await response.json();
      if (response.ok) {
        setTrainings(data.data);
        if (data.pagination) {
          
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching trainings:", error);
    }
    setFetchingTrainings(false);
  }, [chatbotId, debouncedSearchTerm]);


  useEffect(() => {
    getTrainings(1, 10, debouncedSearchTerm);
  }, [debouncedSearchTerm, getTrainings]);


  useEffect(() => {
    getChatbotInfo()
  }, [])

  const copyChatbot = async (chatbotId: string) => {
    setFetchingChatbots(true)
    setLoadingMessage('Copying Chatbot...')
    try {
      const response = await fetch('/api/chatbot-creator/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId }),
      });
      const data = await response.json()
      
      if (data && data.data) {
        router.push(`/chatbots/${data.data.id}`)
      }
    } catch (error) {
      console.error('Failed to copy chatbot:', error);
    }
    
    setLoadingMessage('Loading...')
    
  };

  const deleteChatbot = async (chatbotId: string) => {
    
    setLoadingMessage('Deleting Chatbot...')
    setFetchingChatbots(true)
    try {
      const response = await fetch(`/api/chatbot/${chatbotId}`, { method: 'DELETE' });
      if (response.ok) {
        router.push(`/chatbots/`)
      }
    } catch (error) {
      console.error('Failed to delete chatbot:', error);
    }
    
    setLoadingMessage('Loading...')
  };

  return (
    <div className='pt-12 w-full'>
      
      {
        fetchingChatbots ? <LoadingScreen message={loadingMessage} />
        :
        chatbot ? (
          <>
            <Header chatbot={chatbot} />
            <div className='flex gap-3 py-4 align-center flex-wrap'>
              <ChatbotTrainerBtn setFetchingTrainings={setFetchingTrainings} getTrainings={getTrainings} chatbotId={chatbot.id} />
              <IntegrateChatbotBtn chatbotId={chatbot.id} />
              <Button onClick={() => copyChatbot(chatbot.id)}>Clone</Button>
              <Button onClick={() => deleteChatbot(chatbot.id)}>Delete Chatbot</Button>
              <PublishedBtn getChatbotInfo={getChatbotInfo} publishedStatus={chatbot.publishedStatus} chatbotId={chatbot.id} />
              
            </div>
          </>
        ) : (
          <p className="text-center py-4">No chatbot data available</p>
        )
        
      }

      
      <SearchBar inputPlaceholder={"Search by training name, description..."} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <TableComponent
        getTrainings={getTrainings}
        fetchingTrainings={fetchingTrainings}
        trainings={trainings}
        chatbotId={chatbot?.id || ''}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
      />
    </div>
  )
}
