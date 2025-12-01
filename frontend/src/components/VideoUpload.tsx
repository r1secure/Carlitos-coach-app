'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileVideo, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface VideoUploadProps {
    onUploadComplete: (videoData: any) => void
    maxSizeMB?: number
}

export function VideoUpload({ onUploadComplete, maxSizeMB = 100 }: VideoUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [uploadedVideo, setUploadedVideo] = useState<any | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0])
        }
    }

    const validateAndSetFile = (selectedFile: File) => {
        setError(null)
        setUploadedVideo(null)

        // Validate type
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
        if (!validTypes.includes(selectedFile.type)) {
            setError('Format non supporté. Utilisez MP4, MOV ou AVI.')
            return
        }

        // Validate size
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setError(`Le fichier est trop volumineux (max ${maxSizeMB}MB).`)
            return
        }

        setFile(selectedFile)
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setProgress(0)
        setError(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const xhr = new XMLHttpRequest()

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100
                    setProgress(percentComplete)
                }
            }

            xhr.onload = () => {
                if (xhr.status === 201) {
                    const response = JSON.parse(xhr.responseText)
                    setUploadedVideo(response)
                    onUploadComplete(response)
                    setUploading(false)
                } else {
                    const response = JSON.parse(xhr.responseText)
                    setError(response.detail || 'Erreur lors de l\'upload')
                    setUploading(false)
                }
            }

            xhr.onerror = () => {
                setError('Erreur réseau lors de l\'upload')
                setUploading(false)
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            xhr.open('POST', `${API_URL}/api/v1/videos/upload`)

            const token = localStorage.getItem('access_token')
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            }

            xhr.send(formData)

        } catch (err) {
            console.error(err)
            setError('Une erreur est survenue')
            setUploading(false)
        }
    }

    const clearFile = () => {
        setFile(null)
        setUploadedVideo(null)
        setError(null)
        setProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="w-full">
            {!file && !uploadedVideo ? (
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".mp4,.mov,.avi"
                        onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-4 rounded-full bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-lg font-medium">
                            Cliquez ou glissez une vidéo ici
                        </div>
                        <p className="text-sm text-muted-foreground">
                            MP4, MOV, AVI (max {maxSizeMB}MB)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-muted">
                                <FileVideo className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">
                                    {file?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {file && (file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        {!uploading && !uploadedVideo && (
                            <Button variant="ghost" size="icon" onClick={clearFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm mb-4 bg-destructive/10 p-3 rounded">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {uploading && (
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-xs text-muted-foreground text-right">
                                {Math.round(progress)}%
                            </p>
                        </div>
                    )}

                    {uploadedVideo && (
                        <div className="flex items-center gap-2 text-green-600 text-sm mb-4 bg-green-50 p-3 rounded">
                            <CheckCircle className="h-4 w-4" />
                            Vidéo uploadée avec succès !
                        </div>
                    )}

                    {!uploading && !uploadedVideo && (
                        <Button onClick={handleUpload} className="w-full">
                            Uploader la vidéo
                        </Button>
                    )}

                    {uploadedVideo && (
                        <Button variant="outline" onClick={clearFile} className="w-full">
                            Uploader une autre vidéo
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
