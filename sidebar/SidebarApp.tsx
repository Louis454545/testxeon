import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontalIcon, Square, Plus, Settings } from "lucide-react"
import { useState } from "react"
import './styles.css'

interface Message {
  content: string
  isUser: boolean
}

export default function SidebarApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setIsSending(true)
    
    const newMessage: Message = {
      content: inputValue,
      isUser: true
    }

    setMessages([...messages, newMessage])
    setInputValue("")

    // Reset l'icône après 1 seconde
    setTimeout(() => {
      setIsSending(false)
    }, 1000)
  }

  const handleNewConversation = () => {
    setMessages([])
    setInputValue("")
  }

  return (
    <div className="h-full dark flex flex-col">
      <div className="h-12 px-4 border-b flex justify-end items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleNewConversation}
        >
          <Plus size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
        >
          <Settings size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.isUser
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-secondary/50 text-secondary-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center justify-between space-x-4 p-4 border-t">
        <div className="flex items-center space-x-2 w-full">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Message pour l'IA"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <Button type="submit" size="icon">
            {isSending ? (
              <Square className="text-red-500" />
            ) : (
              <SendHorizontalIcon />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
