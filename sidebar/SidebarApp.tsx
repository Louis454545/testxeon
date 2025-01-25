import {Button} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import { Input } from "@/components/ui/input"
import './styles.css'
import shadcnLogo from '../images/shadcn.svg'

export default function SidebarApp() {
  return (
    <Card className="h-full dark">
      <CardContent className="flex items-center justify-between space-x-4 absolute bottom-0 w-full p-4">
        <Input id="input-test" aria-label="Input Test" placeholder="Test input" />
      </CardContent>
    </Card>
  )
}
