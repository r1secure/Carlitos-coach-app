import React, { useEffect, useRef } from 'react';

interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

interface FrameData {
    frame: number;
    timestamp: number;
    landmarks: Landmark[];
    metrics?: {
        [key: string]: number;
    };
}

interface PoseOverlayProps {
    data: FrameData[];
    currentTime: number;
    width: number;
    height: number;
}

// MediaPipe Pose connections
const CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
    [11, 23], [12, 24], // Torso
    [23, 24], // Hips
    [23, 25], [25, 27], [24, 26], [26, 28], // Legs
    [27, 29], [29, 31], [28, 30], [30, 32] // Feet
];

export const PoseOverlay: React.FC<PoseOverlayProps> = ({ data, currentTime, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (!data || data.length === 0) return;

        // Find frame closest to current time
        // Optimization: Could use binary search or keep track of last index
        const frame = data.find(f => Math.abs(f.timestamp - currentTime) < 0.1); // 100ms tolerance

        if (frame && frame.landmarks) {
            // Draw connections
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;

            CONNECTIONS.forEach(([start, end]) => {
                const startPt = frame.landmarks[start];
                const endPt = frame.landmarks[end];

                if (startPt && endPt && startPt.visibility > 0.5 && endPt.visibility > 0.5) {
                    ctx.beginPath();
                    ctx.moveTo(startPt.x * width, startPt.y * height);
                    ctx.lineTo(endPt.x * width, endPt.y * height);
                    ctx.stroke();
                }
            });

            // Draw points
            ctx.fillStyle = '#FF0000';
            frame.landmarks.forEach(lm => {
                if (lm.visibility > 0.5) {
                    ctx.beginPath();
                    ctx.arc(lm.x * width, lm.y * height, 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });

            // Draw metrics
            if (frame.metrics) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '16px Arial';
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;

                const drawMetric = (value: number, landmarkIdx: number, label: string) => {
                    const lm = frame.landmarks[landmarkIdx];
                    if (lm && lm.visibility > 0.5) {
                        ctx.fillText(`${Math.round(value)}°`, lm.x * width + 10, lm.y * height);
                    }
                };

                if (frame.metrics.right_knee_angle) drawMetric(frame.metrics.right_knee_angle, 26, "R Knee");
                if (frame.metrics.left_knee_angle) drawMetric(frame.metrics.left_knee_angle, 25, "L Knee");
                if (frame.metrics.right_elbow_angle) drawMetric(frame.metrics.right_elbow_angle, 14, "R Elbow");
                if (frame.metrics.left_elbow_angle) drawMetric(frame.metrics.left_elbow_angle, 13, "L Elbow");
            }
        }
    }, [currentTime, data, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 pointer-events-none"
        />
    );
};
