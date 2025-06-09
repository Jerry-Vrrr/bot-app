"use client"
import { Button } from '@/components/ui/button'
import { Website } from '@/types/website';
import { Delete } from 'lucide-react'
import React, { useState } from 'react'

interface ConnectedWebsitesProps {
  websiteId: string;
  chatbotId: string | undefined;
  websites: Website[];
  setWebsites: React.Dispatch<React.SetStateAction<Website[]>>;
}

const DeleteConnectedWebsite = ({websiteId, chatbotId, websites, setWebsites }: ConnectedWebsitesProps) => {

    const [loading, setLoading] = useState(false);
  
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete connection?")) {
          return;
        }
        setLoading(true);
    
        try {
          const res = await fetch(`/api/chatbot/${chatbotId}/wp-sync?websiteId=${websiteId}`, {
            method: "DELETE",
          });
          
          if (res.ok) {
            setWebsites(websites.filter((website) => website._id !== websiteId));
          }
        } catch (error) {
          console.log(error)
        }
        setLoading(false);
      };
    
  return (
    <Button disabled={loading} onClick={()=>handleDelete()}>
      <Delete />
    </Button>
  )
}

export default DeleteConnectedWebsite
