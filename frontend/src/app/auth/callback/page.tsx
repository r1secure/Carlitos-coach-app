'use client'

import { useEffect, Suspense, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
    const { login } = useAuth()
    const searchParams = useSearchParams()
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    const processedRef = useRef(false)

    useEffect(() => {
        if (code && !processedRef.current) {
            processedRef.current = true
            login(code).catch(err => {
                console.error('Login failed:', err)
                processedRef.current = false // Allow retry on failure? Or redirect to login?
            })
        } else if (error) {
            console.error('Auth error:', error)
        }
    }, [code, error, login])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Finalisation de l'authentification...</p>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
