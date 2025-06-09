import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Website } from '@/types/website'
import { convertISODate } from '@/utils/helper'
import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import DeleteConnectedWebsite from './DeleteConnectedWebsite'
import { Label } from '@/components/ui/label'
import { modelOptions } from './modeOptions'
import { Textarea } from '@/components/ui/textarea'

const IntegrateChatbotBtn = ({ chatbotId }: { chatbotId: string }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [websites, setWebsites] = useState<Website[]>([])
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const popupContentRef = useRef<HTMLDivElement>(null)

  // New domain creation state (if needed)
  const [showNewDomainInput, setShowNewDomainInput] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // State to control the popup view: list or integration
  const [dialogView, setDialogView] = useState<'list' | 'integration'>('list')
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)

  // State for update/edit mode in the integration view
  const [editMode, setEditMode] = useState<boolean>(false)
  const [editedChatbotName, setEditedChatbotName] = useState<string>('')
  const [editedDescription, setEditedDescription] = useState<string>('')
  const [editedInstructions, setEditedInstructions] = useState<string>('')
  const [editedTemperature, setEditedTemperature] = useState<string>('0')
  const [editedConversationStarters, setEditedConversationStarters] = useState<string[]>([])
  const [starterInput, setStarterInput] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);


  const fetchWebsites = async (resetResults = false, search = false) => {
    if (isLoading) return;
    if (resetResults && !search) {
      setWebsites([]);
      setSearchTerm("");
    }
    setIsLoading(true);
    try {
      const currentPage = resetResults ? 1 : page;
      const res = await fetch(
        `/api/chatbot-creator/websites?chatbotId=${chatbotId}&page=${currentPage}&limit=10&search=${searchTerm}`
      );
      const data = await res.json();
      if (res.ok) {
        setWebsites((prev: Website[]) => {
          const newWebsites = data.data.filter(
            (newWebsite: Website) => !prev.some((existing) => existing._id === newWebsite._id)
          );
          return resetResults ? data.data : [...prev, ...newWebsites];
        });
        setPage(resetResults ? 1 : currentPage + 1);
        setHasMore(data.pagination.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching websites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when dialog is open
  useEffect(() => {
    if (!open) return
    fetchWebsites()
  }, [open])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setWebsites([])
      setPage(1)
      setHasMore(true)
      setSearchTerm('')
      setShowSearch(false)
      setShowNewDomainInput(false)
      setNewDomain('')
      setDialogView('list')
      setSelectedWebsite(null)
      setEditMode(false)
    }
  }, [open])

  // Scroll event listener for infinite scrolling
  useEffect(() => {
    // Only attach the scroll event listener if the list view is active.
    if (dialogView !== 'list') return;

    const handleScroll = () => {
      if (!popupContentRef.current || !hasMore || isLoading) return;
      const { scrollTop, scrollHeight, clientHeight } = popupContentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        console.log('Bottom reached, loading more...');
        if (hasMore) {
          setPage((prev) => prev + 1);
          fetchWebsites()
        }
      }
    };

    const popupElement = popupContentRef.current;
    if (popupElement) {
      popupElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (popupElement) popupElement.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoading, dialogView]);


  // Handle search 
  const handleSearch = () => {
    fetchWebsites(true, true) // Reset results
  }

  // Handle new domain creation (if needed)
  const handleCreateDomain = async () => {
    if (newDomain.trim() === '') return
    setIsCreating(true)
    try {
      const res = await fetch(`/api/chatbot-creator/websites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domainName: newDomain, chatbotId })
      })
      const data = await res.json()
      if (res.ok) {
        if (data.data) {
          setSelectedWebsite({ ...data.data, conversationStarters: [], instructions: "", description: "", chatbotName: "" })

          setDialogView('integration')

        }
        setNewDomain('')
        setShowNewDomainInput(false)
        fetchWebsites()
      } else {
        console.error('Error creating domain:', data.error)
      }
    } catch (error) {
      console.error('Error creating domain:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle PATCH update for website details
  const handleUpdateWebsite = async () => {
    if (!selectedWebsite) return

    try {
      const res = await fetch(`/api/chatbot-creator/websites/${selectedWebsite._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatbotName: editedChatbotName,
          description: editedDescription,
          instructions: editedInstructions,
          conversationStarters: editedConversationStarters,
          temperature: parseFloat(editedTemperature),
          llm: selectedModel
        })
      })
      const data = await res.json()
      if (res.ok) {
        // Update local selected website data with returned data
        setSelectedWebsite(data.data)
        setEditMode(false)
      } else {
        console.error('Error updating website:', data.error)
      }
    } catch (error) {
      console.error('Error updating website:', error)
    }
  }

  // Handle key down for conversation starters input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddStarter()
    }
  }

  // Add a new conversation starter
  const handleAddStarter = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault()
    if (starterInput.trim() !== '') {
      setEditedConversationStarters(prev => [...prev, starterInput.trim()])
      setStarterInput('')
    }
  }

  // Remove a conversation starter at a given index
  const handleRemoveStarter = (index: number) => {
    setEditedConversationStarters(prev => prev.filter((_, i) => i !== index))
  }
  const findModelOption = (websiteLlm: { modelName: string, provider: string }) => {

    if (!websiteLlm || !websiteLlm.modelName) return modelOptions[0];

    const foundModel = modelOptions.find(option => option.modelName === websiteLlm.modelName);
    return foundModel || modelOptions[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Integrate</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[600px] overflow-y-scroll bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {dialogView === 'list' ? 'Connected Websites' : <Button variant="secondary" onClick={() => setDialogView('list')}>
              <ArrowLeft />
            </Button>}
            {dialogView === 'list' && (
              <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)}>
                {showSearch ? 'Hide Search' : 'Search'}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {dialogView === 'list' ? (
          <>
            {/* Search Input */}
            {showSearch && (
              <div className="flex space-x-2 mb-2">
                <Input
                  className='border-mintGreen'
                  placeholder="Search by domain or URL"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
                <Button onClick={() => fetchWebsites(true)}>Reset</Button>
              </div>
            )}

            {/* Websites List */}
            <div ref={popupContentRef} className="space-y-2 overflow-y-auto max-h-[250px] pb-16">
              {websites.length > 0 ? (
                websites.map((website, index) => (
                  <div
                    key={`${website._id}-${index}`}
                    className="p-2 border border-mintGreen flex justify-between rounded-lg cursor-pointer "

                  >
                    <div
                      className='w-full'
                      onClick={() => {
                        setSelectedWebsite(website)
                        const modelToSelect = findModelOption(website.llm);
                        setSelectedModel(modelToSelect);

                        setEditedChatbotName(website.chatbotName)
                        setEditedDescription(website.description || '')
                        setEditedInstructions(website.instructions)


                        setEditedConversationStarters(website.conversationStarters || [])
                        setDialogView('integration')
                      }}>
                      {website.domainName}
                    </div>
                    <DeleteConnectedWebsite websites={websites} setWebsites={setWebsites} websiteId={website._id} chatbotId={website.chatbotId} />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  {isLoading ? 'Loading...' : 'No websites found.'}
                </p>
              )}

              {hasMore && !isLoading && (
                <p className="text-center mt-2 text-gray-500">Scroll to load more...</p>
              )}
            </div>

            {/* Fixed Add Domain Section */}
            <div className="absolute bottom-0 left-0 right-0 bg-white p-2 border-t flex items-center justify-end">
              {showNewDomainInput ? (
                <div className="flex space-x-2 w-full">
                  <Input
                    placeholder="Enter new domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateDomain()}
                    className="flex-1  border-mintGreen"
                  />
                  <Button onClick={handleCreateDomain} disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Connect'}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowNewDomainInput(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowNewDomainInput(true)}>Connect Website</Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Integration View */}
            <div className="p-4 space-y-4">

              {selectedWebsite && (
                <div>
                  {editMode ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleUpdateWebsite()
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <Label className="block text-sm font-medium text-gray-700">Select Model</Label>
                        <select
                          value={JSON.stringify(selectedModel)}
                          onChange={(e) => {
                            try {
                              const selected = JSON.parse(e.target.value);
                              setSelectedModel(selected);
                            } catch (error) {
                              console.error("Failed to parse model object", error);
                            }
                          }}
                          className="border p-2 rounded w-full border-mintGreen"
                        >
                          {modelOptions.map((option) => (
                            <option key={option.modelName} value={JSON.stringify(option)}>
                              {option.provider} - {option.modelName}
                            </option>
                          ))}
                        </select>

                      </div>

                      <div>
                        <Label className="block text-sm font-medium text-gray-700">
                          Temperature:
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.1}
                          className="flex-1 border-mintGreen"
                          value={editedTemperature}
                          onChange={(e) => setEditedTemperature(e.target.value)}
                        />
                      </div>


                      <div>
                        <Label className="block text-sm font-medium text-gray-700">
                          Chatbot Name:
                        </Label>
                        <Input
                          className="flex-1  border-mintGreen"

                          value={editedChatbotName}
                          onChange={(e) => setEditedChatbotName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700">
                          Description:
                        </Label>
                        <Input
                          value={editedDescription}
                          className="flex-1  border-mintGreen"

                          onChange={(e) => setEditedDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-gray-700">
                          Instructions:
                        </Label>

                        <Textarea
                          id="instructions"
                          name="instructions"
                          className='border-mintGreen'
                          value={editedInstructions}
                          onChange={(e) => setEditedInstructions(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-y-2">
                        <Label className="font-semibold">Conversation Starters</Label>
                        <div className="flex gap-2 items-center mt-2">
                          <Input
                            className="flex-1  border-mintGreen"

                            placeholder="Enter a starter"
                            value={starterInput}
                            onChange={(e) => setStarterInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                          <Button onClick={handleAddStarter}>Add</Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {editedConversationStarters.map((starter, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="border px-2 py-1 rounded">{starter}</span>
                              <Button variant="destructive" size="sm" onClick={() => handleRemoveStarter(index)}>
                                X
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit">Save</Button>
                        <Button variant="secondary" onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">

                      <div className="text-start flex flex-col items-start">
                        <strong>Created At:</strong> {convertISODate(selectedWebsite.createdAt)}
                      </div>
                      <div className="text-start flex flex-col items-start">
                        <strong>Website Id:</strong> {selectedWebsite._id}
                      </div>
                      <div className="text-start flex flex-col items-start">
                        <strong>Chatbot Id:</strong> {selectedWebsite.chatbotId}
                      </div>
                      <div className="text-start flex flex-col items-start">
                        <strong>Large Language model:</strong> {selectedWebsite.llm?.modelName || "No Model Selected Yet"}
                      </div>
                      <div className="text-start flex flex-col items-start">
                        <strong>Model Temperature:</strong> {selectedWebsite?.temperature || "0"}
                      </div>
                      <div className="text-start flex flex-col items-start">
                        <strong>Chatbot Name:</strong> {selectedWebsite.chatbotName}
                      </div>
                      <div className="text-start flex flex-col items-start">
                        <strong>Description:</strong> {selectedWebsite.description}
                      </div>
                      <div className="text-start flex flex-col items-start">
                        <strong>Instructions:</strong> {selectedWebsite.instructions}
                      </div>

                      <p className="text-start flex flex-col items-start">
                        <strong>Conversation starters:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {selectedWebsite.conversationStarters.map((starter, index) => (
                            <li key={index}>{starter}</li>
                          ))}
                        </ul>
                      </p>
                      <Button
                        onClick={() => {
                          // Initialize edit fields with current data when entering edit mode
                          setEditedChatbotName(selectedWebsite.chatbotName)
                          setEditedDescription(selectedWebsite.description || '')
                          setEditedInstructions(selectedWebsite.instructions)
                          setEditedConversationStarters(selectedWebsite.conversationStarters || [])
                          setEditMode(true)
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default IntegrateChatbotBtn
