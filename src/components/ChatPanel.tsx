import React, { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare } from 'lucide-react'

interface ChatMessage {
  id: string
  userId: string
  text: string
  timestamp: number
}

const ChatPanel: React.FC = () => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Simulate chat functionality
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      text: 'Welcome to the collaborative Solidity editor! Start coding together.',
      timestamp: Date.now()
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current-user',
        text: newMessage.trim(),
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getUserColor = (userId: string) => {
    return `hsl(${userId.charCodeAt(0) * 137.5 % 360}, 70%, 60%)`
  }

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar">
      {/* Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-vscode-border">
        <MessageSquare className="w-5 h-5 text-vscode-accent" />
        <h3 className="font-semibold">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="flex space-x-2">
            {message.userId === 'system' ? (
              <div className="text-vscode-text-secondary text-sm italic">
                {message.text}
              </div>
            ) : (
              <>
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: getUserColor(message.userId) }}
                >
                  {message.userId === 'current-user' ? 'U' : 'O'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-vscode-text">
                      {message.userId === 'current-user' ? 'You' : 'Other User'}
                    </span>
                    <span className="text-xs text-vscode-text-secondary">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.userId === 'current-user' && (
                      <span className="text-xs text-vscode-accent">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-vscode-text mt-1">
                    {message.text}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-vscode-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-vscode-panel border border-vscode-border rounded px-3 py-2 text-vscode-text placeholder-vscode-text-secondary focus:outline-none focus:border-vscode-accent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-vscode-accent hover:bg-vscode-accent-hover disabled:bg-vscode-border disabled:text-vscode-text-secondary text-white p-2 rounded transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel 