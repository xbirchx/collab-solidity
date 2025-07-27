import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  userId: string
  nickname: string
  isAdmin: boolean
  canEdit: boolean
  isOnline: boolean
}

interface SessionState {
  sessionId: string
  adminUserId: string | null
  editors: string[]
  users: User[]
}

interface SessionContextType {
  sessionState: SessionState
  currentUserId: string
  isAdmin: boolean
  canEdit: boolean
  addUser: (userId: string, nickname: string) => void
  removeUser: (userId: string) => void
  grantEditPermission: (userId: string) => void
  revokeEditPermission: (userId: string) => void
  transferAdmin: (newAdminUserId: string) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substring(2, 9)
}

const getSessionIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('session')
}

const setSessionIdInUrl = (sessionId: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set('session', sessionId)
  window.history.replaceState({}, '', url.toString())
}

const getStoredSession = (sessionId: string): SessionState | null => {
  try {
    const stored = localStorage.getItem(`session_${sessionId}`)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const storeSession = (sessionState: SessionState) => {
  localStorage.setItem(`session_${sessionState.sessionId}`, JSON.stringify(sessionState))
}

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: '',
    adminUserId: null,
    editors: [],
    users: []
  })
  const [currentUserId, setCurrentUserId] = useState('')

  // Initialize session on mount
  useEffect(() => {
    let sessionId = getSessionIdFromUrl()
    let storedSession: SessionState | null = null

    if (sessionId) {
      storedSession = getStoredSession(sessionId)
    }

    if (!sessionId || !storedSession) {
      // Create new session
      sessionId = generateSessionId()
      setSessionIdInUrl(sessionId)
      
      const newUserId = generateUserId()
      setCurrentUserId(newUserId)
      
      const newSession: SessionState = {
        sessionId,
        adminUserId: newUserId,
        editors: [newUserId],
        users: [{
          userId: newUserId,
          nickname: 'You',
          isAdmin: true,
          canEdit: true,
          isOnline: true
        }]
      }
      
      setSessionState(newSession)
      storeSession(newSession)
    } else {
      // Join existing session
      const newUserId = generateUserId()
      setCurrentUserId(newUserId)
      
      const updatedSession = {
        ...storedSession,
        users: [
          ...storedSession.users,
          {
            userId: newUserId,
            nickname: `User-${newUserId.slice(-6)}`,
            isAdmin: false,
            canEdit: false,
            isOnline: true
          }
        ]
      }
      
      setSessionState(updatedSession)
      storeSession(updatedSession)
    }
  }, [])

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `session_${sessionState.sessionId}` && e.newValue) {
        try {
          const updatedSession = JSON.parse(e.newValue)
          setSessionState(updatedSession)
        } catch {
          // Ignore invalid JSON
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [sessionState.sessionId])

  const updateSession = (updater: (prev: SessionState) => SessionState) => {
    setSessionState(prev => {
      const updated = updater(prev)
      storeSession(updated)
      return updated
    })
  }

  const addUser = (userId: string, nickname: string) => {
    updateSession(prev => ({
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

  const removeUser = (userId: string) => {
    updateSession(prev => ({
      ...prev,
      users: prev.users.filter(user => user.userId !== userId)
    }))
  }

  const grantEditPermission = (userId: string) => {
    updateSession(prev => ({
      ...prev,
      editors: [...prev.editors, userId],
      users: prev.users.map(user => 
        user.userId === userId ? { ...user, canEdit: true } : user
      )
    }))
  }

  const revokeEditPermission = (userId: string) => {
    updateSession(prev => ({
      ...prev,
      editors: prev.editors.filter(id => id !== userId),
      users: prev.users.map(user => 
        user.userId === userId ? { ...user, canEdit: false } : user
      )
    }))
  }

  const transferAdmin = (newAdminUserId: string) => {
    updateSession(prev => ({
      ...prev,
      adminUserId: newAdminUserId,
      users: prev.users.map(user => ({
        ...user,
        isAdmin: user.userId === newAdminUserId
      }))
    }))
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
      addUser,
      removeUser,
      grantEditPermission,
      revokeEditPermission,
      transferAdmin
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