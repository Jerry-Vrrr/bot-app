'use client'

import { chatbotCreaterBase } from '@/types/chatbot'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit } from 'lucide-react'
import { convertISODate } from '@/utils/helper'
import Image from 'next/image'
import { modelOptions } from '../common/modeOptions'

interface FormDataI {
    chatbotName: string;
    description: string;
    temperature: number;
    instructions: string;
    conversationStarters: string[];
    llm: { provider: string, modelName: string };
}

const Header = ({ chatbot }: { chatbot: chatbotCreaterBase }) => {
    const [chatbotImage, setChatbotImage] = useState<File | null>(null)
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<FormDataI>({
        chatbotName: chatbot.chatbotName,
        description: chatbot.description,
        instructions: chatbot.instructions,
        temperature: chatbot.temperature ?? 0,
        conversationStarters: chatbot.conversationStarters,
        llm: chatbot.llm || { provider: "OpenAI", modelName: "gpt-4o-mini" }
    })
    const [starterInput, setStarterInput] = useState('');

    const handleAddStarter = (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (e) e.preventDefault()
        if (starterInput.trim() !== '') {
            setFormData((prev) => ({
                ...prev,
                conversationStarters: [...prev.conversationStarters, starterInput.trim()],
            }));
            setStarterInput('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formDataToSend = new FormData();
        formDataToSend.append("id", chatbot.id);
        formDataToSend.append("chatbotName", formData.chatbotName);
        formDataToSend.append("description", formData.description ?? '');
        formDataToSend.append("instructions", formData.instructions);
        formDataToSend.append("temperature", formData.temperature?.toString() || '0');
        formDataToSend.append("llm", JSON.stringify(formData.llm));
        formData.conversationStarters.forEach((starter) => {
            formDataToSend.append("conversationStarters", starter);
        });

        if (chatbotImage) {
            formDataToSend.append("chatbotPic", chatbotImage);
        }

        try {
            const response = await fetch('/api/chatbot-creator', {
                method: 'PUT',
                body: formDataToSend
            })

            if (response.ok) {
                setOpen(false)
                window.location.reload()
            }
        } catch (error) {
            console.error('Error updating chatbot:', error)
        }
    }

    const handleRemoveStarter = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            conversationStarters: prev.conversationStarters.filter((_, i) => i !== index),
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        console.log(name, value, ' :::')
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddStarter();
        }
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedModel = modelOptions.find(m => m.modelName === e.target.value);
        if (selectedModel) {
            setFormData(prev => ({
                ...prev,
                llm: selectedModel
            }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === "image/jpeg" || file.type === "image/png") {
                setChatbotImage(file)
            } else {
                alert("Only JPEG and PNG files are allowed")
                e.target.value = ""
            }
        }
    };

    return (
        <div className='flex justify-between items-start w-full'>
            <div className='flex flex-col items-start justify-start w-full'>
                <div className='w-full pb-5'>
                    <Image
                        src={chatbot.chatbotPic || '/images/fallback-image.jpg'}
                        className='object-cover rounded-sm'
                        width={250}
                        height={180}
                        alt={chatbot.chatbotName}
                    />
                </div>
                <span className='flex flex-col items-start'><strong>Created At:</strong> {convertISODate(chatbot.createdAt)}</span>
                <span className='flex flex-col items-start'><strong>Large Language model:</strong> {chatbot.llm?.modelName || "No Model Selected Yet"}</span>
                <span className='flex flex-col items-start'><strong>Model Temperature:</strong> {chatbot.temperature || "0"}</span>
                <span className='flex flex-col items-start'><strong>Chatbot Name:</strong> {chatbot.chatbotName}</span>
                <p className='text-start flex flex-col items-start'><strong>Description:</strong> {chatbot.description}</p>
                <p className='text-start flex flex-col items-start'><strong>Instruction/System Prompt:</strong> {chatbot.instructions}</p>
                <p className="text-start flex flex-col items-start">
                    <strong>Conversation starters:</strong>
                    <ul className="list-disc pl-5 mt-1">
                        {chatbot.conversationStarters.map((starter, index) => (
                            <li key={index}>{starter}</li>
                        ))}
                    </ul>
                </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                        <DialogTitle>Edit Chatbot</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="font-semibold">Upload Bot Image</Label>
                            <Input
                                className="mt-2 border-mintGreen"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="modelName">Select Model</Label>
                            <select
                                id="llm"
                                name="llm"
                                value={formData.llm.modelName}
                                onChange={handleModelChange}
                                className="border border-mintGreen p-2 rounded"
                            >
                                {modelOptions.map((option) => (
                                    <option key={option.modelName} value={option.modelName}>
                                        {option.provider} - {option.modelName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="block text-sm font-medium text-gray-700">
                                Temperature:
                            </Label>
                            <Input
                                type="number"
                                name="temperature"
                                min={0}
                                max={1}
                                step={0.1}
                                className="flex-1 border-mintGreen"
                                value={formData.temperature}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="chatbotName">Chatbot Name</Label>
                            <Input
                                id="chatbotName"
                                name="chatbotName"
                                value={formData.chatbotName}
                                onChange={handleChange}
                                className='border-mintGreen'
                            />
                        </div>


                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                className='border-mintGreen'
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="instructions">Instructions/System Message</Label>
                            <Textarea
                                id="instructions"
                                name="instructions"
                                className='border-mintGreen'
                                value={formData.instructions}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <Label className="font-semibold">Conversation Starters</Label>
                            <div className="flex gap-2  items-center">
                                <Input
                                    className='border-mintGreen'
                                    placeholder="Enter a question"
                                    value={starterInput}
                                    onChange={(e) => setStarterInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button onClick={handleAddStarter}>Add</Button>
                            </div>
                            <div className="mt-2">
                                {formData.conversationStarters.map((starter, index) => (
                                    <div key={index} className="flex items-center gap-2 mt-1">
                                        <span className="border px-2 py-1 rounded">{starter}</span>
                                        <Button variant="destructive" size="sm" onClick={() => handleRemoveStarter(index)}>
                                            X
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit">Save changes</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Header