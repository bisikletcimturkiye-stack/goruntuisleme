import cv2
import time
import random
import requests
import json
from ultralytics import YOLO

# MOCK SETTINGS - In production, these would be real hardware interfaces
CAMERA_SOURCE = 0 # 0 for webcam, or RTSP URL for IP Camera
SCALE_PORT = "COM3" # Serial port for scale
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-api-key"

class FeedTrackingEdge:
    def __init__(self, model_path='yolov8n.pt'):
        # Load YOLO model (pretrained or custom)
        self.model = YOLO(model_path)
        self.current_weight = 0.0
        self.is_logging = False
        self.last_feed_type = None

    def get_scale_weight(self):
        """
        Mock function to read weight from scale.
        In production, use pyserial to read from RS232.
        """
        # Mocking an increasing weight as feed is added
        if self.is_logging:
            self.current_weight += random.uniform(0.5, 2.0)
        return round(self.current_weight, 2)

    def send_to_cloud(self, feed_type, weight, confidence):
        """
        Sends detected data to Supabase
        """
        payload = {
            "farm_id": "YOUR_FARM_UUID", # This would be configured per device
            "mixer_id": "MIXER_001",
            "feed_type": feed_type,
            "actual_weight_kg": weight,
            "detected_confidence": float(confidence),
            "timestamp": "now()"
        }
        print(f"[CLOUD] Sending: {feed_type} - {weight} kg")
        # requests.post(f"{SUPABASE_URL}/rest/v1/feed_logs", json=payload, headers={"apikey": SUPABASE_KEY})

    def run(self):
        cap = cv2.VideoCapture(CAMERA_SOURCE)
        MIN_WEIGHT_DELTA = 5.0 # Minimum kg change to trigger as a valid feed event
        
        print(f"System started. Monitoring mixer (Threshold: {MIN_WEIGHT_DELTA}kg)...")

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            # AI Inference
            results = self.model(frame, stream=True, verbose=False)
            
            detected_feed = None
            max_conf = 0

            for r in results:
                for box in r.boxes:
                    conf = box.conf[0]
                    cls = int(box.cls[0])
                    label = self.model.names[cls]
                    
                    if conf > 0.5:
                        detected_feed = label
                        max_conf = conf

            current_scale_weight = self.get_scale_weight()

            # Logic: If feed is detected AND weight is increasing
            if detected_feed and not self.is_logging:
                self.is_logging = True
                self.last_feed_type = detected_feed
                self.start_log_weight = current_scale_weight
                print(f"[DETECTED] {detected_feed} - Starting weight: {self.start_log_weight}kg")
            
            elif self.is_logging:
                weight_delta = current_scale_weight - self.start_log_weight
                
                # If feed signal is lost OR weight stops increasing for a while
                if not detected_feed:
                    if weight_delta >= MIN_WEIGHT_DELTA:
                        print(f"[FINISHED] {self.last_feed_type} completed. Delta: {weight_delta}kg")
                        self.send_to_cloud(self.last_feed_type, round(weight_delta, 2), max_conf)
                    else:
                        print(f"[DISCARDED] {self.last_feed_type} - Insufficient weight change ({weight_delta}kg)")
                    
                    self.is_logging = False
                    self.current_weight = 0 # Reset mock for next item (In production, this is cumulative)

            # UI Overlay
            status_color = (0, 255, 0) if self.is_logging else (0, 0, 255)
            cv2.putText(frame, f"Status: {'LOGGING' if self.is_logging else 'IDLE'}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, status_color, 2)
            cv2.putText(frame, f"Weight: {self.get_scale_weight()} kg", (10, 70), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            cv2.imshow("Feed Tracking System - Edge Module", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    tracker = FeedTrackingEdge()
    tracker.run()
