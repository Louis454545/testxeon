import { useState } from "react"
import { Header } from "./components/Header"
import { MessageList } from "./components/MessageList"
import { MessageInput } from "./components/MessageInput"
import { Message } from "./types"
import './styles.css'

export default function SidebarApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)

  const handleNewConversation = () => {
    setMessages([])
  }

  const handleSubmitMessage = (content: string) => {
    setIsSending(true)
    
    const newMessage: Message = {
      content,
      isUser: true
    }

    setMessages([...messages, newMessage])

    // Reset sending state after 1 second
    setTimeout(() => {
      setIsSending(false)
    }, 1000)
  }

  return (
    <div className="h-full dark flex flex-col">
      <Header onNewConversation={handleNewConversation} />
      <MessageList messages={messages} />
      <MessageInput 
        onSubmit={handleSubmitMessage}
        isSending={isSending}
      />
    </div>
  )
}
