const PublishedBtn = ({ chatbotId, publishedStatus, getChatbotInfo }: { chatbotId: string, publishedStatus: boolean, getChatbotInfo: () => Promise<void>; }) => {
  const publishedHandler = async (chatbotId: string) => {
    try {
      const response = await fetch(`/api/chatbot/${chatbotId}`, {
        method: "PATCH",
        body: JSON.stringify({ publishedStatus: publishedStatus })
      });
      await response.json();

      if (response.ok) {
        
        await getChatbotInfo()
      }

    } catch (error) {
      console.log(error, ' :error')
    }
  }
  return (
    <button className="font-semibold" onClick={() => publishedHandler(chatbotId)}>
      {publishedStatus ? "Published" : " Publish"}
    </button>
  )
}

export default PublishedBtn
