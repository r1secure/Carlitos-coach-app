'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { VideoUpload } from '@/components/VideoUpload'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, Trash2, Play, FileVideo } from 'lucide-react'
import Link from 'next/link'

interface Video {
    id: string
    filename: string
    thumbnail_url: string | null
    duration: number | null
    size_bytes: number
    format: string
    created_at: string
}

interface Quota {
    used_bytes: number
    quota_bytes: number
    usage_percent: number
    remaining_bytes: number
}

export default function MyVideosPage() {
    const { user, loading: authLoading } = useAuth()
    const [videos, setVideos] = useState<Video[]>([])
    const [quota, setQuota] = useState<Quota | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token')
            const headers = { Authorization: `Bearer ${token}` }
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const [videosRes, quotaRes] = await Promise.all([
                fetch(`${API_URL}/api/v1/videos/my-videos`, { headers }),
                fetch(`${API_URL}/api/v1/videos/quota/usage`, { headers })
            ])

            if (videosRes.ok) {
                setVideos(await videosRes.json())
            }
            if (quotaRes.ok) {
                setQuota(await quotaRes.json())
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (user) {
            fetchData()
        }
    }, [user, fetchData])

    const handleDelete = async (videoId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return

        try {
            const token = localStorage.getItem('access_token')
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${API_URL}/api/v1/videos/${videoId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                fetchData() // Refresh list and quota
            }
        } catch (error) {
            console.error('Error deleting video:', error)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mes Vidéos</h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez vos vidéos pour l'analyse biomécanique
                        </p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline">Retour au tableau de bord</Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Upload Section */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Uploader une vidéo</CardTitle>
                            <CardDescription>
                                Ajoutez une nouvelle vidéo pour analyse (MP4, MOV, AVI)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VideoUpload onUploadComplete={fetchData} maxSizeMB={100} />
                        </CardContent>
                    </Card>

                    {/* Quota Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Espace de stockage</CardTitle>
                            <CardDescription>
                                Utilisation de votre quota de 1GB
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quota && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Utilisé: {(quota.used_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                                            <span>{quota.usage_percent}%</span>
                                        </div>
                                        <Progress value={quota.usage_percent} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Il vous reste {(quota.remaining_bytes / (1024 * 1024)).toFixed(2)} MB de libre.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Videos List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Vidéos récentes</h2>
                    {videos.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileVideo className="h-12 w-12 mb-4 opacity-20" />
                                <p>Aucune vidéo uploadée pour le moment.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {videos.map((video) => (
                                <Link href={`/dashboard/videos/${video.id}`} key={video.id}>
                                    <Card className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                        <div className="aspect-video bg-black relative">
                                            {video.thumbnail_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={video.thumbnail_url}
                                                    alt={video.filename}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                                    <FileVideo className="h-12 w-12" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play className="h-12 w-12 text-white fill-white" />
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="truncate">
                                                    <p className="font-medium truncate" title={video.filename}>
                                                        {video.filename}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(video.created_at).toLocaleDateString()} • {(video.size_bytes / (1024 * 1024)).toFixed(1)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(video.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
