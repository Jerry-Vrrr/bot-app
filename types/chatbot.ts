export interface chatbotCreaterBase {
    id: string;
    chatbotPic: string;
    chatbotName: string;
    llm:  { provider: string, modelName: string };
    description: string;
    createdAt: string;
    conversationStarters: string[];
    publishedStatus: boolean;
    instructions: string;
    temperature: number;
    publishAt?: string;
    updatedAt?: string;
}

export type TrainingData = {
  id: string;
  name: string;
  description: string;
  createdAt: string,
  updatedAt: string,
};
export interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface ApiResponse {
  data: chatbotCreaterBase[]; // Assuming the API returns an object with a `data` array
  pagination?: PaginationData;

}
