import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, Settings, User, Home, Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useKeyboardShortcut } from '@/hooks'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action: () => void
  category?: string
  shortcut?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  items?: CommandItem[]
}

export function CommandPalette({ isOpen, onClose, items = [] }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Default commands
  const defaultCommands: CommandItem[] = [
    {
      id: 'home',
      title: 'Bosh sahifa',
      icon: <Home className="h-4 w-4" />,
      action: () => { navigate('/'); onClose() },
      category: 'Navigatsiya',
    },
    {
      id: 'jobs',
      title: 'Ishlar',
      icon: <Briefcase className="h-4 w-4" />,
      action: () => { navigate('/jobs'); onClose() },
      category: 'Navigatsiya',
    },
    {
      id: 'profile',
      title: 'Profil',
      icon: <User className="h-4 w-4" />,
      action: () => { navigate('/profile'); onClose() },
      category: 'Navigatsiya',
    },
    {
      id: 'settings',
      title: 'Sozlamalar',
      icon: <Settings className="h-4 w-4" />,
      action: () => { navigate('/settings'); onClose() },
      category: 'Sozlamalar',
    },
  ]

  const allCommands = [...defaultCommands, ...items]

  // Filter commands based on query
  const filteredCommands = query === ''
    ? allCommands
    : allCommands.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
      )

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, item) => {
    const category = item.category || 'Boshqa'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as Record<string, CommandItem[]>)

  // Keyboard navigation
  useKeyboardShortcut(['ArrowDown'], (e) => {
    if (!isOpen) return
    e.preventDefault()
    setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
  }, { preventDefault: true })

  useKeyboardShortcut(['ArrowUp'], (e) => {
    if (!isOpen) return
    e.preventDefault()
    setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
  }, { preventDefault: true })

  useKeyboardShortcut(['Enter'], (e) => {
    if (!isOpen) return
    e.preventDefault()
    const command = filteredCommands[selectedIndex]
    if (command) {
      command.action()
      onClose()
    }
  }, { preventDefault: true })

  useKeyboardShortcut(['Escape'], () => {
    if (isOpen) onClose()
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog as="div" static open={isOpen} onClose={onClose} className="relative z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Command Palette */}
          <div className="fixed inset-0 flex items-start justify-center pt-[20vh] px-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  placeholder="Qidiruv yoki buyruq kiriting..."
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-b border-secondary-200 dark:border-secondary-800 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-12 text-center text-secondary-500">
                    Natija topilmadi
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category} className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-secondary-400 uppercase">
                        {category}
                      </div>
                      {commands.map((command) => {
                        const globalIndex = filteredCommands.indexOf(command)
                        return (
                          <button
                            key={command.id}
                            onClick={() => {
                              command.action()
                              onClose()
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                              globalIndex === selectedIndex
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                : 'hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-700 dark:text-secondary-300'
                            )}
                          >
                            {command.icon && (
                              <div className="flex-shrink-0">{command.icon}</div>
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-medium">{command.title}</div>
                              {command.subtitle && (
                                <div className="text-xs text-secondary-500">
                                  {command.subtitle}
                                </div>
                              )}
                            </div>
                            {command.shortcut && (
                              <div className="flex-shrink-0 text-xs text-secondary-400 font-mono">
                                {command.shortcut}
                              </div>
                            )}
                            {globalIndex === selectedIndex && (
                              <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-secondary-200 dark:border-secondary-800 px-4 py-3 bg-secondary-50 dark:bg-secondary-950 flex items-center justify-between text-xs text-secondary-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-secondary-800 rounded">↑↓</kbd>
                    Tanlash
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-secondary-800 rounded">Enter</kbd>
                    Ochish
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-secondary-800 rounded">Esc</kbd>
                    Yopish
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-secondary-800 rounded">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-secondary-800 rounded">K</kbd>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

// Hook to use command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useKeyboardShortcut(['meta', 'k'], (e) => {
    e.preventDefault()
    setIsOpen(true)
  }, { preventDefault: true })

  useKeyboardShortcut(['ctrl', 'k'], (e) => {
    e.preventDefault()
    setIsOpen(true)
  }, { preventDefault: true })

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  }
}
