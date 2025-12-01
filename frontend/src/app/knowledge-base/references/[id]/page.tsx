'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PoseOverlay } from '@/components/video/PoseOverlay'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ReferenceVideoPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const videoRef = useRef<HTMLVideoElement>(null)

    const [video, setVideo] = useState<any>(null)
    const [analysis, setAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(0)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [playbackRate, setPlaybackRate] = useState(1.0)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate
        }
    }, [playbackRate])

    const fetchVideo = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token')
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${API_URL}/api/v1/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                setVideo(await res.json())
            } else {
                toast.error("Erreur lors du chargement de la vidéo")
            }
        } catch (error) {
            console.error(error)
        }
    }, [id])

    const fetchAnalysis = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token')
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${API_URL}/api/v1/videos/${id}/analysis`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                setAnalysis(await res.json())
            }
        } catch (error) {
            console.error(error)
        }
    }, [id])

    useEffect(() => {
        if (user && id) {
            Promise.all([fetchVideo(), fetchAnalysis()]).finally(() => setLoading(false))
        }
    }, [user, id, fetchVideo, fetchAnalysis])

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDimensions({
                width: videoRef.current.clientWidth,
                height: videoRef.current.clientHeight
            })
        }
    }

    // Update dimensions on resize
    useEffect(() => {
        const handleResize = () => {
            if (videoRef.current) {
                setDimensions({
                    width: videoRef.current.clientWidth,
                    height: videoRef.current.clientHeight
                })
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    if (!video) return <div className="p-8">Vidéo non trouvée</div>

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/knowledge-base">
                        <Button variant="ghost" className="text-white hover:text-white/80">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la Base de Connaissances
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">{video.extra_metadata?.player_name || video.filename}</h1>
                    <div className="flex gap-2">
                        <Select value={playbackRate.toString()} onValueChange={(val) => setPlaybackRate(parseFloat(val))}>
                            <SelectTrigger className="w-[100px] bg-zinc-900 border-zinc-700 text-white">
                                <SelectValue placeholder="Vitesse" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0.25">0.25x</SelectItem>
                                <SelectItem value="0.5">0.5x</SelectItem>
                                <SelectItem value="0.75">0.75x</SelectItem>
                                <SelectItem value="1">1.0x</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
                    <video
                        ref={videoRef}
                        src={video.url}
                        controls
                        className="w-full h-full object-contain"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        crossOrigin="anonymous"
                    />
                    {analysis && analysis.status === 'completed' && dimensions.width > 0 && (
                        <PoseOverlay
                            data={analysis.data}
                            currentTime={currentTime}
                            width={dimensions.width}
                            height={dimensions.height}
                        />
                    )}
                </div>

                {video.extra_metadata && (
                    <Card className="bg-zinc-900 border-zinc-800 text-white mt-4">
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">Informations</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-zinc-400">Joueur:</span> {video.extra_metadata.player_name || '-'}
                                </div>
                                <div>
                                    <span className="text-zinc-400">Coup:</span> {video.extra_metadata.stroke_type || '-'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
