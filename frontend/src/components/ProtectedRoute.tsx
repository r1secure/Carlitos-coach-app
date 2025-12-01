'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: ('admin' | 'coach' | 'player')[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }

        if (!loading && isAuthenticated && user && allowedRoles) {
            if (!allowedRoles.includes(user.role)) {
                router.push('/dashboard') // Or unauthorized page
            }
        }
    }, [loading, isAuthenticated, user, router, allowedRoles])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null
    }

    return <>{children}</>
}
