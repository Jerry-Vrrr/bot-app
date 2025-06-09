'use client'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/common/LoadingScreen'
import CustomAlert from '@/components/common/CustomAlert'
import { Textarea } from '@/components/ui/textarea'
import useAutoResetError from '@/hooks/useAutoResetError'

interface Props {
  text: string;
  style?: string;
  icon?: React.ReactNode;
}

const CreateChatbotBtn = ({ icon, text, style }: Props) => {
  const [creatingChatbot, setCreatingChatbot] = useState<boolean>(false)
  const [chatbotImage, setChatbotImage] = useState<File | null>(null)
  const [chatbotName, setChatbotName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const { error, setError } = useAutoResetError(3000);
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreatingChatbot(true)
    setError(null)
    if (!chatbotName.trim()) {
      setError("Chatbot name is required.");
      setCreatingChatbot(false)
      return;
    }

    if (!description.trim()) {
      setCreatingChatbot(false)
      setError("Description is required.");
      return;
    }


    try {
      const formData = new FormData()
      formData.append('chatbotName', chatbotName)
      formData.append('description', description)

      if (chatbotImage) {
        formData.append('chatbotImage', chatbotImage)
      }

      const response = await fetch("/api/chatbot-creator", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setIsOpen(false) // Close the modal only on success
        router.push(`/chatbots/${data.data.id}`)
      } else {
        setError(data.message || "Something went wrong. Please try again.")
      }
    } catch (error) {
      setError("Failed to create chatbot. Please check your input and try again.")
      console.log(error)
    }

    setCreatingChatbot(false)
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
    <>
      {creatingChatbot && <LoadingScreen />}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className={`${style}`} onClick={() => setIsOpen(true)}>
            {text} {icon}
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Create a chatbot</DialogTitle>
            <DialogDescription>
              Please input the fields to create a chatbot.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {
              error && <CustomAlert type={"error"} title={"Error"} message={error} />
            }
            
            <div className="py-4">

              <div className="flex flex-col">
                <Label className="font-semibold">Upload Bot Image</Label>
                <Input
                  className="mt-2 border-mintGreen"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
              <div className="pb-5">
                <Label>Chatbot Name</Label>
                <Input
                  type="text"
                  className="outline-none w-full border  border-mintGreen rounded-sm mt-2 p-2"
                  placeholder="E.g CleverseoBot"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                />
              </div>
              <div className="pb-5">
                <Label>Description</Label>
              
                <Textarea
                  id="description"
                  name="description"
                  className="outline-none w-full text-md border  border-mintGreen rounded-sm mt-2 p-2"
                  placeholder="E.g the chatbot is trained to answer any questions related to cleverseo.ai"

                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

            </div>
            <DialogFooter>
              <Button disabled={creatingChatbot} type="submit">
                {creatingChatbot ? "Creating..." : "Create Chatbot"}
              </Button>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreateChatbotBtn
