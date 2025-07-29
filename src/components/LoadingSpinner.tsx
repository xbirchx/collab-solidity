import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-vscode-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-vscode-accent animate-spin mx-auto mb-4" />
        <p className="text-vscode-text">Initializing session...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner 