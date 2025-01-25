import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontalIcon } from "lucide-react"
import './styles.css'

export default function SidebarApp() {
  return (
    <div className="h-full dark">
      <div className="flex items-center justify-between space-x-4 absolute bottom-0 w-full p-4">
      <div className="flex items-center space-x-2 w-full">
        <div className="flex-1">
        <Input type="text" placeholder="Message pour l'IA" />
      </div>
        <Button type="submit" size="icon"><SendHorizontalIcon /></Button>
      </div>
    </div>
    </div>
  )
}
