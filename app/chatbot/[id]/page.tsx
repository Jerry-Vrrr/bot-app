'use server'

import Chatbot from "@/components/chatbot/Chatbot";

export default async function  Page({ params }: { params: Promise<{ id: string }> }) {
  const searchedParams = await params
  return (
    <Chatbot chatbotId = {searchedParams.id} />
  );
}
