import React from 'react'
import { Users, Circle } from 'lucide-react'

const UserList: React.FC = () => {
  // Simulate connected users
  const connectedUsers = [
    { userId: 'user1', isYou: true, nickname: 'You' },
    { userId: 'user2', isYou: false, nickname: 'User-abc123' }
  ]

  const getUserColor = (userId: string) => {
    return `hsl(${userId.charCodeAt(0) * 137.5 % 360}, 70%, 60%)`
  }

  const getUserInitials = (userId: string) => {
    const nickname = userId === 'user1' ? 'You' : 'User-abc123'
    if (nickname) {
      return nickname.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    }
    return userId.slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar">
      {/* Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-vscode-border">
        <Users className="w-5 h-5 text-vscode-accent" />
        <h3 className="font-semibold">Connected Users</h3>
        <span className="ml-auto text-sm text-vscode-text-secondary">
          {connectedUsers.length}
        </span>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {connectedUsers.map((user) => (
          <div key={user.userId} className="flex items-center space-x-3 p-3 bg-vscode-panel rounded-lg">
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: getUserColor(user.userId) }}
              >
                {getUserInitials(user.userId)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-vscode-success rounded-full border-2 border-vscode-sidebar flex items-center justify-center">
                <Circle className="w-2 h-2 text-white fill-current" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-vscode-text">
                  {user.nickname}
                </span>
                {user.isYou && (
                  <span className="text-xs bg-vscode-accent text-white px-2 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-vscode-text-secondary">
                {user.isYou ? 'Current user' : 'Connected'}
              </div>
            </div>
          </div>
        ))}
        
        {connectedUsers.length === 0 && (
          <div className="text-center text-vscode-text-secondary py-8">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users connected</p>
            <p className="text-sm">Share the session link to invite others</p>
          </div>
        )}
      </div>

      {/* Session Info */}
      <div className="p-4 border-t border-vscode-border">
        <div className="text-sm text-vscode-text-secondary">
          <div className="flex justify-between">
            <span>Session:</span>
            <span className="text-vscode-text">solidity-editor-session</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Status:</span>
            <span className="text-vscode-success">Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserList 