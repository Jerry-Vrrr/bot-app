import { ChatbotTrainingInterface } from "@/components/chatbots/chatbot/ChatbotTrainingInterface";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const context = await params
  return (
    <ChatbotTrainingInterface chatbotId={context.id} />
  )
}

export default Page