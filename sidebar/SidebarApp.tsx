import { Input } from "@/components/ui/input"
import './styles.css'

export default function SidebarApp() {
  return (
    <div className="h-full dark">
      <div className="flex items-center justify-between space-x-4 absolute bottom-0 w-full p-4">
        <Input id="input-test" aria-label="Input Test" placeholder="Test input" />
      </div>
    </div>
  )
}
