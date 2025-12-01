'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

interface PermissionGuardProps {
    permission: string
    children: ReactNode
    fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
    const { user } = useAuth()

    if (!user) return null

    // Admin has all permissions by default (or we can check user.role === 'admin')
    if (user.role === 'admin') return <>{children}</>

    // Check specific permission
    if (user.permissions && user.permissions[permission]) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
