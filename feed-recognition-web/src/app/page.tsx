'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Zap, AlertTriangle } from 'lucide-react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analysis, setAnalysis] = useState<string>("Sistem Hazır. Bekleniyor...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      console.error("Camera Error:", err);
      setCameraError("Kamera başlatılamadı. Lütfen izinleri kontrol edin.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Capture and Analyze Function
  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysis(prev => isLiveMode ? prev : "AI Düşünüyor...");

    try {
      // Draw frame to canvas
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        // Get base64 image
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);

        // Send to API
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });

        const data = await response.json();

        if (data.error) {
          setAnalysis("Hata: " + data.error);
        } else {
          setAnalysis(data.result);
        }
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysis("Bağlantı Hatası!");
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, isLiveMode]);

  // Live Mode Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveMode) {
      interval = setInterval(() => {
        if (!isAnalyzing) {
          analyzeFrame();
        }
      }, 3000); // Every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isLiveMode, isAnalyzing, analyzeFrame]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white relative overflow-hidden">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-400 flex items-center gap-2">
          <Zap className="fill-current" /> Çiftçi AI
        </h1>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${isLiveMode ? 'bg-red-600 animate-pulse' : 'bg-gray-700'}`}>
          {isLiveMode ? 'CANLI MOD' : 'MANUEL'}
        </div>
      </div>

      {/* Camera View */}
      <div className="relative flex-1 flex items-center justify-center bg-gray-900">
        {cameraError ? (
          <div className="text-center p-6 bg-red-900/50 rounded-lg border border-red-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-500" />
            <p>{cameraError}</p>
            <button onClick={startCamera} className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700">Tekrar Dene</button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading Indicator Overlay */}
        {isAnalyzing && (
          <div className="absolute top-4 right-4 z-30">
            <RefreshCw className="w-6 h-6 text-yellow-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Analysis Result Area */}
      <div className="absolute bottom-24 left-4 right-4 z-20">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
          <p className="text-lg font-medium text-center leading-relaxed">
            {analysis}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/80 p-6 pb-8 flex justify-around items-center gap-4">

        {/* Live Mode Toggle */}
        <button
          onClick={() => setIsLiveMode(!isLiveMode)}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${isLiveMode ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
        >
          <RefreshCw className={`w-8 h-8 ${isLiveMode ? 'animate-spin-slow' : ''}`} />
          <span className="text-xs font-bold">CANLI</span>
        </button>

        {/* Shutter Button (Main Action) */}
        {!isLiveMode && (
          <button
            onClick={analyzeFrame}
            disabled={isAnalyzing}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
        )}

        {/* Placeholder for Gallery/Menu (can be added later) */}
        <div className="w-12"></div>

      </div>
    </main>
  );
}
