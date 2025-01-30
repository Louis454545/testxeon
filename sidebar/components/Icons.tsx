import {
  CheckCircle,
  XCircle,
  MousePointer,
  Keyboard,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  check: CheckCircle,
  x: XCircle,
  click: MousePointer,
  keyboard: Keyboard,
  help: HelpCircle,
} as const;