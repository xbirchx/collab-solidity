import { useState } from 'react'
import CodeEditor from './components/CodeEditor'
import ChatPanel from './components/ChatPanel'
import UserList from './components/UserList'
import SharePanel from './components/SharePanel'
import { MessageSquare, Users, Share2, Code2 } from 'lucide-react'
import { useSession } from './contexts/SessionContext'

function App() {
  const [activePanel, setActivePanel] = useState<'chat' | 'users' | 'share' | null>(null)
  const { sessionState } = useSession()

  return (
    <div className="h-screen w-screen bg-vscode-bg text-vscode-text flex flex-col">
      {/* Header */}
      <header className="bg-vscode-sidebar border-b border-vscode-border flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          <Code2 className="w-6 h-6 text-vscode-accent" />
          <h1 className="text-lg font-semibold">Collaborative Solidity Editor</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActivePanel(activePanel === 'users' ? null : 'users')}
            className={`p-2 rounded hover:bg-vscode-panel transition-colors ${
              activePanel === 'users' ? 'bg-vscode-accent text-white' : 'text-vscode-text-secondary'
            }`}
            title="Connected Users"
          >
            <Users className="w-5 h-5" />
            <span className="ml-1 text-xs bg-vscode-accent text-white px-1.5 py-0.5 rounded-full">
              {sessionState.users.length}
            </span>
          </button>
          
          <button
            onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
            className={`p-2 rounded hover:bg-vscode-panel transition-colors ${
              activePanel === 'chat' ? 'bg-vscode-accent text-white' : 'text-vscode-text-secondary'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActivePanel(activePanel === 'share' ? null : 'share')}
            className={`p-2 rounded hover:bg-vscode-panel transition-colors ${
              activePanel === 'share' ? 'bg-vscode-accent text-white' : 'text-vscode-text-secondary'
            }`}
            title="Share Session"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 relative min-w-0">
          <CodeEditor />
        </div>

        {/* Side Panels */}
        {activePanel && (
          <div className="w-80 bg-vscode-sidebar border-l border-vscode-border flex flex-col flex-shrink-0">
            {activePanel === 'chat' && <ChatPanel />}
            {activePanel === 'users' && <UserList />}
            {activePanel === 'share' && <SharePanel />}
          </div>
        )}
      </div>
    </div>
  )
}

export default App 