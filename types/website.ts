
  export interface Website {
    _id: string;
    chatbotName: string;
    description?: string;
    chatbotId?: string;
    conversationStarters: string[];
    instructions: string;
    domainName: string;
    temperature: string;
    llm: { provider: string; modelName: string }; 
    createdAt: Date;
    updatedAt: Date;
    }
  
  export interface WebsiteApiResponse {
    data: Website[]; // Assuming the API returns an object with a `data` array
}
