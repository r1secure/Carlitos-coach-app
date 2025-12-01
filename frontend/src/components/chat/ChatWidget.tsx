'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, X, Send, Loader2, User, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
}

export function ChatWidget() {
    const { token } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Load session on open
    useEffect(() => {
        if (isOpen && !sessionId) {
            fetchLatestSession()
        }
    }, [isOpen])

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isOpen])

    const fetchLatestSession = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${API_URL}/api/v1/chat/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const sessions = await res.json()
                if (sessions.length > 0) {
                    const latest = sessions[0]
                    setSessionId(latest.id)
                    fetchMessages(latest.id)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchMessages = async (sid: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${API_URL}/api/v1/chat/sessions/${sid}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setMessages(data.messages)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const sendMessage = async () => {
        if (!input.trim()) return

        const userMsg = input
        setInput('')
        setLoading(true)

        // Optimistic update
        const tempId = Date.now().toString()
        setMessages(prev => [...prev, {
            id: tempId,
            role: 'user',
            content: userMsg,
            created_at: new Date().toISOString()
        }])

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${API_URL}/api/v1/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: userMsg
                })
            })

            if (res.ok) {
                const aiMsg = await res.json()
                // Update messages with real AI response
                setMessages(prev => [...prev, aiMsg])

                // If new session created
                if (!sessionId) {
                    // We need to fetch sessions to get the ID, but the API returns the message.
                    // The API doesn't return session ID in message response currently.
                    // Let's refresh sessions.
                    fetchLatestSession()
                }
            } else {
                toast.error("Erreur lors de l'envoi du message")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erreur technique")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-[100]">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-[350px] h-[500px] flex flex-col shadow-xl bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            Coach Virtuel
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-zinc-500 text-sm mt-8">
                                        Posez une question à votre coach virtuel !
                                    </div>
                                )}
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-zinc-800 text-zinc-100'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-zinc-800 rounded-lg p-3">
                                            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t border-zinc-800 flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Écrivez votre message..."
                                className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-blue-600"
                            />
                            <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
