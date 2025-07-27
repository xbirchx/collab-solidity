import React from 'react'
import { Users, Circle, Crown, Edit, Eye, Settings } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'

const UserList: React.FC = () => {
  const { sessionState, currentUserId, isAdmin, grantEditPermission, revokeEditPermission, transferAdmin } = useSession()

  const getUserColor = (userId: string) => {
    return `hsl(${userId.charCodeAt(0) * 137.5 % 360}, 70%, 60%)`
  }

  const getUserInitials = (user: any) => {
    if (user.nickname) {
      return user.nickname.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    }
    return user.userId.slice(0, 2).toUpperCase()
  }

  const handleGrantEdit = (userId: string) => {
    grantEditPermission(userId)
  }

  const handleRevokeEdit = (userId: string) => {
    revokeEditPermission(userId)
  }

  const handleTransferAdmin = (userId: string) => {
    if (window.confirm('Are you sure you want to transfer admin privileges?')) {
      transferAdmin(userId)
    }
  }

  return (
    <div className="flex flex-col h-full bg-vscode-sidebar">
      {/* Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-vscode-border">
        <Users className="w-5 h-5 text-vscode-accent" />
        <h3 className="font-semibold">Connected Users</h3>
        <span className="ml-auto text-sm text-vscode-text-secondary">
          {sessionState.users.length}
        </span>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sessionState.users.map((user) => (
          <div key={user.userId} className="flex items-center space-x-3 p-3 bg-vscode-panel rounded-lg">
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: getUserColor(user.userId) }}
              >
                {getUserInitials(user)}
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
                {user.userId === currentUserId && (
                  <span className="text-xs bg-vscode-accent text-white px-2 py-0.5 rounded">
                    You
                  </span>
                )}
                {user.isAdmin && (
                  <span className="text-xs bg-vscode-warning text-vscode-bg px-2 py-0.5 rounded flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                )}
                {user.canEdit && !user.isAdmin && (
                  <span className="text-xs bg-vscode-success text-white px-2 py-0.5 rounded flex items-center">
                    <Edit className="w-3 h-3 mr-1" />
                    Editor
                  </span>
                )}
                {!user.canEdit && !user.isAdmin && (
                  <span className="text-xs bg-vscode-text-secondary text-vscode-bg px-2 py-0.5 rounded flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Viewer
                  </span>
                )}
              </div>
              <div className="text-xs text-vscode-text-secondary">
                {user.userId === currentUserId ? 'Current user' : 'Connected'}
              </div>
            </div>

            {/* Admin Controls */}
            {isAdmin && user.userId !== currentUserId && (
              <div className="flex items-center space-x-1">
                {user.canEdit ? (
                  <button
                    onClick={() => handleRevokeEdit(user.userId)}
                    className="p-1 text-vscode-text-secondary hover:text-vscode-error transition-colors"
                    title="Revoke edit permission"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleGrantEdit(user.userId)}
                    className="p-1 text-vscode-text-secondary hover:text-vscode-success transition-colors"
                    title="Grant edit permission"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleTransferAdmin(user.userId)}
                  className="p-1 text-vscode-text-secondary hover:text-vscode-warning transition-colors"
                  title="Transfer admin"
                >
                  <Crown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {sessionState.users.length === 0 && (
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
            <span className="text-vscode-text font-mono">{sessionState.sessionId}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Status:</span>
            <span className="text-vscode-success">Active</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Your Role:</span>
            <span className={`${isAdmin ? 'text-vscode-warning' : 'text-vscode-text'}`}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserList 