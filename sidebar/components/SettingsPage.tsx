import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Theme = 'light' | 'dark' | 'system';

export function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    // Load theme preference on mount
    chrome.storage.local.get('theme', (result) => {
      setTheme(result.theme ?? 'system')
    })

    // Listen for system theme changes if using system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateThemeClass('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const updateThemeClass = (newTheme: Theme) => {
    if (newTheme === 'system') {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.className = isDarkMode ? 'dark' : ''
    } else {
      document.documentElement.className = newTheme === 'dark' ? 'dark' : ''
    }
  }

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme)
    await chrome.storage.local.set({ theme: newTheme })
    updateThemeClass(newTheme)
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the extension looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label>Theme</Label>
            <RadioGroup 
              value={theme} 
              onValueChange={(value: string) => handleThemeChange(value as Theme)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">Use system theme</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}