'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PoseOverlay } from '@/components/video/PoseOverlay'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft, Activity } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FeedbackDisplay } from '@/components/video/FeedbackDisplay'
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function VideoPlayerPage() {
    const { id } = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const videoRef = useRef<HTMLVideoElement>(null)

    const [video, setVideo] = useState<any>(null)
    const [analysis, setAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(0)
    const [analyzing, setAnalyzing] = useState(false)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [playbackRate, setPlaybackRate] = useState(1.0)

    // Comparison Mode State
    const [comparisonMode, setComparisonMode] = useState(false)
    const [referenceVideos, setReferenceVideos] = useState<any[]>([])
    const [selectedReference, setSelectedReference] = useState<any>(null)
    const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false)
    const refVideoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate
        }
        if (refVideoRef.current) {
            refVideoRef.current.playbackRate = playbackRate
        }
    }, [playbackRate, comparisonMode])

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

    const fetchReferenceVideos = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token')
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${API_URL}/api/v1/videos/references/list`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                setReferenceVideos(await res.json())
            }
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        if (isReferenceDialogOpen) {
            fetchReferenceVideos()
        }
    }, [isReferenceDialogOpen, fetchReferenceVideos])

    useEffect(() => {
        if (user && id) {
            Promise.all([fetchVideo(), fetchAnalysis()]).finally(() => setLoading(false))
        } else if (!user) {
            // If auth is done but no user, stop loading (AuthContext handles redirect usually, but just in case)
            const timer = setTimeout(() => setLoading(false), 1000)
            return () => clearTimeout(timer)
        }
    }, [user, id, fetchVideo, fetchAnalysis])

    // Poll for analysis status if pending
    useEffect(() => {
        if (analysis && (analysis.status === 'pending' || analysis.status === 'processing')) {
            const interval = setInterval(fetchAnalysis, 3000)
            return () => clearInterval(interval)
        }
    }, [analysis, fetchAnalysis])

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

    const [feedbackLoading, setFeedbackLoading] = useState(false)

    const generateFeedback = async (force: boolean = false) => {
        setFeedbackLoading(true)
        try {
            const token = localStorage.getItem('access_token')
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${API_URL}/api/v1/videos/${id}/feedback?force_regenerate=${force}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                const feedback = await res.json()
                setAnalysis({ ...analysis, ai_feedback: feedback })
                toast.success("Feedback généré avec succès !")
            } else {
                toast.error("Erreur lors de la génération du feedback")
            }
        } catch (error) {
            toast.error("Erreur technique")
        } finally {
            setFeedbackLoading(false)
        }
    }

    const triggerAnalysis = async () => {
        setAnalyzing(true)
        try {
            const token = localStorage.getItem('access_token')
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const res = await fetch(`${API_URL}/api/v1/videos/${id}/analyze`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.ok) {
                toast.success("Analyse lancée ! Elle sera disponible dans quelques instants.")
                setAnalysis({ ...analysis, status: 'pending' })
            } else {
                toast.error("Erreur lors du lancement de l'analyse")
            }
        } catch (error) {
            toast.error("Erreur technique")
        } finally {
            setAnalyzing(false)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    if (!video) return <div className="p-8">Vidéo non trouvée</div>

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/videos">
                        <Button variant="ghost" className="text-white hover:text-white/80">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">{video.filename}</h1>
                    <div className="flex gap-2">
                        {(!analysis || analysis.status === 'failed' || analysis.status === 'pending' || analysis.status === 'processing') && (
                            <Button
                                onClick={triggerAnalysis}
                                disabled={analyzing || (analysis && (analysis.status === 'pending' || analysis.status === 'processing'))}
                                variant={analysis?.status === 'pending' || analysis?.status === 'processing' ? "secondary" : "default"}
                            >
                                {analyzing || (analysis && (analysis.status === 'pending' || analysis.status === 'processing')) ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...</>
                                ) : (
                                    <><Activity className="mr-2 h-4 w-4" /> Lancer l'analyse</>
                                )}
                            </Button>
                        )}

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

                        <Dialog open={isReferenceDialogOpen} onOpenChange={setIsReferenceDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant={comparisonMode ? "destructive" : "default"}
                                    className={!comparisonMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                                    onClick={() => comparisonMode && setComparisonMode(false)}
                                >
                                    {comparisonMode ? "Quitter Comparaison" : "Comparer"}
                                </Button>
                            </DialogTrigger>
                            {!comparisonMode && (
                                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Choisir une vidéo de référence</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        {referenceVideos.length === 0 ? (
                                            <p className="text-zinc-400">Aucune vidéo de référence disponible.</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                {referenceVideos.map((refVideo) => (
                                                    <div
                                                        key={refVideo.id}
                                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => {
                                                            setSelectedReference(refVideo)
                                                            setComparisonMode(true)
                                                            setIsReferenceDialogOpen(false)
                                                        }}
                                                    >
                                                        <div className="aspect-video bg-black rounded-md overflow-hidden mb-2">
                                                            {refVideo.thumbnail_url ? (
                                                                <img src={refVideo.thumbnail_url} alt={refVideo.filename} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-zinc-500">No Thumb</div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium truncate">{refVideo.filename}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            )}
                        </Dialog>
                    </div>
                </div>

                <div className={`grid gap-4 ${comparisonMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Main Video */}
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

                    {/* Reference Video */}
                    {comparisonMode && selectedReference && (
                        <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
                            <video
                                ref={refVideoRef}
                                src={selectedReference.url || `/api/v1/videos/${selectedReference.id}/stream`} // Assuming stream endpoint or direct URL if available
                                controls
                                className="w-full h-full object-contain"
                                crossOrigin="anonymous"
                            />
                            {/* Note: Reference video analysis overlay could be added here if available */}
                        </div>
                    )}
                </div>

                {analysis && analysis.status === 'failed' && (
                    <Card className="bg-red-900/20 border-red-900">
                        <CardContent className="p-4 text-red-400">
                            Erreur d'analyse : {analysis.error_message}
                        </CardContent>
                    </Card>
                )}

                {/* AI Feedback Section */}
                {analysis && analysis.status === 'completed' && (
                    <FeedbackDisplay
                        feedback={analysis.ai_feedback}
                        onGenerate={() => generateFeedback(true)}
                        loading={feedbackLoading}
                    />
                )}
            </div>

            <ChatWidget />
        </div>
    )
}
