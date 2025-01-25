import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon } from "lucide-react"
import './styles.css'

export default function SidebarApp() {
  return (
    <div className="h-full dark">
      <div className="flex items-center justify-between space-x-4 absolute bottom-0 w-full p-4">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="email" placeholder="Email" />
        <Button type="submit"><SendIcon className="align-middle" /></Button>
      </div>
      </div>
    </div>
  )
}
