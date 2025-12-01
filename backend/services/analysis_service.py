"""
Analysis Service
Handles video processing using MediaPipe Pose
"""
import cv2
import mediapipe as mp
import numpy as np
import tempfile
import os
import logging
from typing import List, Dict, Any
import ssl

# WORKAROUND: Disable SSL verification for MediaPipe model download
# This fixes "certificate verify failed: self-signed certificate in certificate chain"
ssl._create_default_https_context = ssl._create_unverified_context

from services.storage_service import storage_service

logger = logging.getLogger(__name__)

class AnalysisService:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        # Initialize with default parameters
        # We'll create a new instance per process_video call or use a context manager
        # to ensure thread safety if needed, but for Celery it's usually one task per process.

    def process_video(self, storage_path: str) -> List[Dict[str, Any]]:
        """
        Process video and extract pose landmarks
        
        Args:
            storage_path: Path to video in MinIO
            
        Returns:
            List of frame data with landmarks
        """
        tmp_path = None
        try:
            # Download video to temp file
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
                tmp_path = tmp_file.name
            
            logger.info(f"Downloading video from {storage_path} to {tmp_path}")
            storage_service.client.fget_object(
                storage_service.bucket_name,
                storage_path,
                tmp_path
            )
            
            # Process video
            cap = cv2.VideoCapture(tmp_path)
            frames_data = []
            frame_count = 0
            
            # Initialize Pose for this video
            with self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=2,
                enable_segmentation=False,
                min_detection_confidence=0.5
            ) as pose:
                
                while cap.isOpened():
                    success, image = cap.read()
                    if not success:
                        break
                    
                    # Convert BGR to RGB
                    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                    results = pose.process(image_rgb)
                    
                    frame_data = {
                        "frame": frame_count,
                        "timestamp": cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0,
                        "landmarks": []
                    }
                    
                    if results.pose_landmarks:
                        landmarks = results.pose_landmarks.landmark
                        
                        # Extract key landmarks
                        # Map: 11=left_shoulder, 12=right_shoulder, 13=left_elbow, 14=right_elbow
                        # 15=left_wrist, 16=right_wrist, 23=left_hip, 24=right_hip
                        # 25=left_knee, 26=right_knee, 27=left_ankle, 28=right_ankle
                        
                        def get_lm(idx):
                            lm = landmarks[idx]
                            return {"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility}

                        def calculate_angle(a, b, c):
                            """Calculate angle between three points (a-b-c) in 2D space"""
                            a = np.array([a.x, a.y])
                            b = np.array([b.x, b.y])
                            c = np.array([c.x, c.y])
                            
                            ba = a - b
                            bc = c - b
                            
                            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
                            angle = np.arccos(cosine_angle)
                            return np.degrees(angle)

                        # Calculate angles if visibility is good enough
                        metrics = {}
                        
                        # Right Knee Flexion (Hip-Knee-Ankle)
                        if landmarks[24].visibility > 0.5 and landmarks[26].visibility > 0.5 and landmarks[28].visibility > 0.5:
                            metrics["right_knee_angle"] = calculate_angle(landmarks[24], landmarks[26], landmarks[28])
                            
                        # Left Knee Flexion
                        if landmarks[23].visibility > 0.5 and landmarks[25].visibility > 0.5 and landmarks[27].visibility > 0.5:
                            metrics["left_knee_angle"] = calculate_angle(landmarks[23], landmarks[25], landmarks[27])

                        # Right Elbow Flexion (Shoulder-Elbow-Wrist)
                        if landmarks[12].visibility > 0.5 and landmarks[14].visibility > 0.5 and landmarks[16].visibility > 0.5:
                            metrics["right_elbow_angle"] = calculate_angle(landmarks[12], landmarks[14], landmarks[16])

                        # Left Elbow Flexion
                        if landmarks[11].visibility > 0.5 and landmarks[13].visibility > 0.5 and landmarks[15].visibility > 0.5:
                            metrics["left_elbow_angle"] = calculate_angle(landmarks[11], landmarks[13], landmarks[15])

                        for landmark in landmarks:
                            frame_data["landmarks"].append({
                                "x": landmark.x,
                                "y": landmark.y,
                                "z": landmark.z,
                                "visibility": landmark.visibility
                            })
                        
                        frame_data["metrics"] = metrics
                    
                    frames_data.append(frame_data)
                    frame_count += 1
            
            cap.release()
            logger.info(f"Processed {frame_count} frames")
            return frames_data
            
        except Exception as e:
            logger.error(f"Error processing video: {e}")
            raise
        finally:
            # Cleanup temp file
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

# Create singleton instance
analysis_service = AnalysisService()
