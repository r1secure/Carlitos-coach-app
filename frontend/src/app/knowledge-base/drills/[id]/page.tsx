'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Target, Calendar, Video as VideoIcon } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Video {
    id: string
    filename: string
    url: string
    thumbnail_url: string | null
}

interface Drill {
    id: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    focus_area: 'technique' | 'physical' | 'mental' | 'tactical'
    equipment: string[]
    videos: Video[]
    created_at: string
}

export default function DrillDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [drill, setDrill] = useState<Drill | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeVideo, setActiveVideo] = useState<Video | null>(null)

    useEffect(() => {
        if (params.id) {
            fetchDrill(params.id as string)
        }
    }, [params.id])

    const fetchDrill = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/knowledge-base/drills/${id}`)
            if (!response.ok) throw new Error('Drill not found')
            const data = await response.json()
            setDrill(data)
            if (data.videos && data.videos.length > 0) {
                // Fetch full video details to get signed URL
                fetchVideoDetails(data.videos[0].id)
            }
        } catch (error) {
            console.error('Error fetching drill:', error)
            router.push('/knowledge-base')
        } finally {
            setLoading(false)
        }
    }

    const fetchVideoDetails = async (videoId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/videos/${videoId}`)
            if (response.ok) {
                const videoData = await response.json()
                setActiveVideo(videoData)
            }
        } catch (error) {
            console.error('Error fetching video:', error)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        )
    }

    if (!drill) return null

    return (
        <div className="container mx-auto py-8 px-4">
            <Link href="/knowledge-base" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la base de connaissances
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <Target className="mr-1 h-3 w-3" />
                                Drill
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {drill.difficulty}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {drill.focus_area}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">{drill.title}</h1>
                        <div className="flex items-center text-muted-foreground text-sm mb-6">
                            <Calendar className="mr-2 h-4 w-4" />
                            Ajouté le {new Date(drill.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Video Player */}
                    {activeVideo ? (
                        <Card className="overflow-hidden bg-black">
                            <video
                                src={activeVideo.url}
                                controls
                                className="w-full aspect-video"
                                poster={activeVideo.thumbnail_url || undefined}
                            >
                                Votre navigateur ne supporte pas la lecture de vidéos.
                            </video>
                            <div className="p-4 bg-card">
                                <h3 className="font-medium flex items-center gap-2">
                                    <VideoIcon className="h-4 w-4" />
                                    {activeVideo.filename}
                                </h3>
                            </div>
                        </Card>
                    ) : drill.videos.length > 0 ? (
                        <Card className="p-8 text-center bg-muted/30">
                            <p>Chargement de la vidéo...</p>
                        </Card>
                    ) : null}

                    {/* Video List (if multiple) */}
                    {drill.videos.length > 1 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {drill.videos.map((video) => (
                                <div
                                    key={video.id}
                                    onClick={() => fetchVideoDetails(video.id)}
                                    className={`cursor-pointer border rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all ${activeVideo?.id === video.id ? 'ring-2' : ''}`}
                                >
                                    <div className="aspect-video bg-muted relative flex items-center justify-center">
                                        {video.thumbnail_url ? (
                                            <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <VideoIcon className="h-8 w-8 text-muted-foreground" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors" />
                                    </div>
                                    <div className="p-2 text-xs font-medium truncate bg-card">
                                        {video.filename}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none whitespace-pre-wrap">
                                {drill.description}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-sm text-muted-foreground block mb-1">Équipement requis</span>
                                {drill.equipment && drill.equipment.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {drill.equipment.map((item, i) => (
                                            <Badge key={i} variant="secondary">{item}</Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-sm">Aucun équipement spécifique</span>
                                )}
                            </div>

                            <div className="pt-4 border-t">
                                <span className="text-sm text-muted-foreground block mb-1">Zone de travail</span>
                                <p className="capitalize font-medium">{drill.focus_area}</p>
                            </div>

                            <div className="pt-4 border-t">
                                <span className="text-sm text-muted-foreground block mb-1">Niveau</span>
                                <p className="capitalize font-medium">{drill.difficulty}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
