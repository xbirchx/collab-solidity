import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService, SessionState } from '../services/api'

interface SessionContextType {
  sessionState: SessionState
  currentUserId: string
  isAdmin: boolean
  canEdit: boolean
  isLoading: boolean
  error: string | null
  addUser: (userId: string, nickname: string) => void
  removeUser: (userId: string) => void
  grantEditPermission: (userId: string) => void
  revokeEditPermission: (userId: string) => void
  transferAdmin: (newAdminUserId: string) => void
  updateUserNickname: (nickname: string) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const getSessionIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('session')
}

const setSessionIdInUrl = (sessionId: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set('session', sessionId)
  window.history.replaceState({}, '', url.toString())
}

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: '',
    adminUserId: null,
    editors: [],
    users: []
  })
  const [currentUserId, setCurrentUserId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let sessionId = getSessionIdFromUrl()
        
        if (sessionId) {
          // Try to join existing session
          try {
            const result = await apiService.joinSession(sessionId)
            setSessionState(result.session)
            setCurrentUserId(result.currentUserId)
            setSessionIdInUrl(sessionId)
          } catch (err) {
            console.error('Failed to join session:', err)
            // Session doesn't exist, create new one
            sessionId = null
          }
        }
        
        if (!sessionId) {
          // Create new session
          const result = await apiService.createSession()
          setSessionState(result.session)
          setCurrentUserId(result.currentUserId)
          setSessionIdInUrl(result.session.sessionId)
        }
      } catch (err) {
        console.error('Failed to initialize session:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize session')
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [])

  // Poll for session updates
  useEffect(() => {
    if (!sessionState.sessionId) return

    const pollInterval = setInterval(async () => {
      try {
        const updatedSession = await apiService.getSession(sessionState.sessionId)
        setSessionState(updatedSession)
      } catch (err) {
        console.error('Failed to poll session:', err)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [sessionState.sessionId])

  const addUser = (userId: string, nickname: string) => {
    setSessionState(prev => ({
      ...prev,
      users: [...prev.users, {
        userId,
        nickname,
        isAdmin: false,
        canEdit: false,
        isOnline: true
      }]
    }))
  }

  const removeUser = async (userId: string) => {
    try {
      const updatedSession = await apiService.removeUser(sessionState.sessionId, userId)
      setSessionState(updatedSession)
    } catch (err) {
      console.error('Failed to remove user:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove user')
    }
  }

  const grantEditPermission = async (userId: string) => {
    try {
      const updatedSession = await apiService.updatePermissions(
        sessionState.sessionId,
        'grant_edit',
        userId,
        sessionState.adminUserId!
      )
      setSessionState(updatedSession)
    } catch (err) {
      console.error('Failed to grant edit permission:', err)
      setError(err instanceof Error ? err.message : 'Failed to grant edit permission')
    }
  }

  const revokeEditPermission = async (userId: string) => {
    try {
      const updatedSession = await apiService.updatePermissions(
        sessionState.sessionId,
        'revoke_edit',
        userId,
        sessionState.adminUserId!
      )
      setSessionState(updatedSession)
    } catch (err) {
      console.error('Failed to revoke edit permission:', err)
      setError(err instanceof Error ? err.message : 'Failed to revoke edit permission')
    }
  }

  const transferAdmin = async (newAdminUserId: string) => {
    try {
      const updatedSession = await apiService.updatePermissions(
        sessionState.sessionId,
        'transfer_admin',
        newAdminUserId,
        sessionState.adminUserId!
      )
      setSessionState(updatedSession)
    } catch (err) {
      console.error('Failed to transfer admin:', err)
      setError(err instanceof Error ? err.message : 'Failed to transfer admin')
    }
  }

  const updateUserNickname = async (nickname: string) => {
    try {
      const updatedSession = await apiService.updateUser(sessionState.sessionId, currentUserId, { nickname })
      setSessionState(updatedSession)
    } catch (err) {
      console.error('Failed to update nickname:', err)
      setError(err instanceof Error ? err.message : 'Failed to update nickname')
    }
  }

  const currentUser = sessionState.users.find(user => user.userId === currentUserId)
  const isAdmin = currentUser?.isAdmin || false
  const canEdit = currentUser?.canEdit || false

  return (
    <SessionContext.Provider value={{
      sessionState,
      currentUserId,
      isAdmin,
      canEdit,
      isLoading,
      error,
      addUser,
      removeUser,
      grantEditPermission,
      revokeEditPermission,
      transferAdmin,
      updateUserNickname
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
} 