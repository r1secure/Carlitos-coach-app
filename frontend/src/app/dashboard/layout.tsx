'use client'

import { ChatWidget } from '@/components/chat/ChatWidget'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && user) {
            if (user.validation_status === 'PENDING' || user.validation_status === 'REJECTED') {
                router.push('/pending')
            }
        }
    }, [user, loading, router])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    }

    return (
        <>
            {children}
            {user?.permissions?.can_use_virtual_coach && <ChatWidget />}
        </>
    )
}
