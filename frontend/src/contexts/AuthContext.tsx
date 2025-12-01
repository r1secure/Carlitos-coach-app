'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    email: string
    full_name: string
    avatar_url: string
    role: 'admin' | 'coach' | 'player'
    // Profile Fields
    first_name?: string | null
    last_name?: string | null
    birth_date?: string | null
    ranking?: string | null
    fft_club?: string | null
    tenup_profile_url?: string | null
    handedness?: 'RIGHT' | 'LEFT' | null
    backhand_style?: 'ONE_HANDED' | 'TWO_HANDED' | null
    play_style?: string | null
}

interface AuthContextType {
    user: User | null
    token: string | null
    loading: boolean
    login: (code: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const storedToken = localStorage.getItem('access_token')
        if (!storedToken) {
            setLoading(false)
            return
        }
        setToken(storedToken)

        try {
            // Add timestamp to prevent caching
            const response = await fetch(`${API_URL}/api/v1/users/me?t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Cache-Control': 'no-cache'
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                // Token invalid or expired
                logout()
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const login = async (code: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            })

            if (!response.ok) {
                throw new Error('Login failed')
            }

            const data = await response.json()
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            setToken(data.access_token)

            await checkAuth()
            router.push('/dashboard')
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
        setToken(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            refreshUser: checkAuth,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
