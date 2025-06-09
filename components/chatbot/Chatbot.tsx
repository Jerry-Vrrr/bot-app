"use client"
import { useState, useEffect } from "react";
import { Maximize2, Minimize2, User, Bot } from 'lucide-react'; // Make sure to install lucide-react
import { chatbotCreaterBase } from "@/types/chatbot";
import useAutoResetError from "@/hooks/useAutoResetError";

export default function Chatbot({ chatbotId }: { chatbotId: string }) {
    const [input, setInput] = useState<string>("");
    const [chat, setChat] = useState<{ sender: string; text: string }[]>([]);
    const [chatbotInfo, setChatbotInfo] = useState<chatbotCreaterBase | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAgentTalking, setIsAgentTalking] = useState<boolean>(false);
    const { error, setError } = useAutoResetError(3000);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    // "data" is kept as implemented though we update the chat directly via streaming

    // Load chat history from sessionStorage
    useEffect(() => {
        const loadChatHistory = () => {
            const storedChat = sessionStorage.getItem(`chat_history_${chatbotId}`);
            if (storedChat) {
                setChat(JSON.parse(storedChat));
                return true;
            }
            return false;
        };

        const fetchChatbotInfo = async () => {
            try {
                const response = await fetch(`/api/chatbot/${chatbotId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch chatbot information");
                }

                const data = await response.json();
                
                setChatbotInfo(data.data);

                // Only add welcome message if there's no existing chat history
                const hasExistingChat = loadChatHistory();
                if (!hasExistingChat) {
                    setChat([
                        {
                            sender: "assistant",
                            text: `Welcome to ${data.data.chatbotName}! How can I help you today?`,
                        },
                    ]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchChatbotInfo();
    }, [chatbotId]);

    // Save chat history to sessionStorage whenever it changes
    useEffect(() => {
        if (chat.length > 0) {
            sessionStorage.setItem(`chat_history_${chatbotId}`, JSON.stringify(chat));
        }
    }, [chat, chatbotId]);

    // sendMessage implements streaming and updates the chat state as chunks arrive.
    async function sendMessage(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        // Append the user's message
        setChat((prev) => [...prev, { sender: "human", text: input }]);
        const userMessage = input;
        setInput("");
        setIsAgentTalking(true);

        try {
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage, chatbotId, instructions: chatbotInfo?.instructions, chatbotName: chatbotInfo?.chatbotName }),
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulatedText = "";

            // Add a placeholder for the assistant's response
            setChat((prev) => [...prev, { sender: "assistant", text: "" }]);

            // Read the stream chunk by chunk
            while (!done) {
                const { done: doneReading, value } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value);

                accumulatedText += chunkValue.replace(/["\n]/g, "");
                accumulatedText = accumulatedText.replace(/html/i, "");
                accumulatedText = accumulatedText.replace(/```/i, "");

                // Update the last message (assistant) with the accumulated text
                setChat((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { sender: "assistant", text: accumulatedText };
                    return updated;
                });
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Error occurred during message send.");
        } finally {
            setIsAgentTalking(false);
        }
    }

    // Clear chat history function
    const clearChat = () => {
        sessionStorage.removeItem(`chat_history_${chatbotId}`);
        setChat([
            {
                sender: "assistant",
                text: `Welcome to ${chatbotInfo?.chatbotName || 'Customer Care'}! How can I help you today?`,
            },
        ]);
    };


    // Toggle chat size function
    const toggleSize = () => {
        setIsExpanded(!isExpanded);
        // Send message to parent window to resize iframe if needed
        if (window.parent) {
            window.parent.postMessage(
                {
                    type: "resize",
                    isExpanded: !isExpanded,
                },
                "*"
            );
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "resize") {
                setIsExpanded(event.data.isExpanded);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 bg-gray-100">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <h1 className="text-2xl font-bold">
                        {chatbotInfo?.chatbotName || "Customer Care"}
                    </h1>
                    <button
                        onClick={toggleSize}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label={isExpanded ? "Minimize chat" : "Maximize chat"}
                    >
                        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
                <button
                    onClick={clearChat}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                    Clear Chat
                </button>
            </div>

            {chatbotInfo?.description && (
                <p className="text-sm text-gray-600 mb-4">{chatbotInfo.description}</p>
            )}

            <div className="bg-white p-4 w-full rounded shadow mb-4 ">
                {chat.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 flex gap-2 ${msg.sender === "human" ? "text-right" : "text-left"
                            }`}
                    >
                        {msg.sender === "human" && (
                            <span>
                                <User size={40} className="text-blue-500" />
                            </span>
                        )}
                        <div
                            dangerouslySetInnerHTML={{ __html: msg.text }}
                            className={`px-3 w-full py-2 rounded ${msg.sender === "human" ? "bg-blue-200" : "bg-gray-200"
                                }`}
                        />
                        {/* </div> */}
                        {msg.sender === "assistant" && (
                            <span>
                                <Bot size={40} className="text-blue-500" />
                            </span>
                        )}

                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="w-full flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border p-2 rounded-l"
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
                />
                <button
                    disabled={isAgentTalking}
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600 transition-colors"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
