'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Zap, AlertTriangle, Upload, Image as ImageIcon, X } from 'lucide-react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analysis, setAnalysis] = useState<string>("Sistem Hazır. Bekleniyor...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // --- CAMERA HANDLING ---
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: 'environment',
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
      setCameraError("Kamera erişimi sağlanamadı. Lütfen izin verin veya 'Dosya Yükle' modunu kullanın.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
      setIsLiveMode(false);
    }
    return () => stopCamera();
  }, [mode]);

  // --- IMAGE ANALYSIS ---
  const analyzeImage = async (base64Image: string) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    if (!isLiveMode) setAnalysis("AI Görüntüyü Analiz Ediyor...");

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      if (data.error) {
        setAnalysis("Hata: " + data.error);
      } else {
        setAnalysis(data.result);
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysis("Sunucu Bağlantı Hatası! İnternetinizi kontrol edin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const captureAndAnalyze = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      analyzeImage(imageData);
    }
  }, [stream]);

  // --- FILE UPLOAD HANDLING ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LIVE MODE LOOP ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveMode && mode === 'camera') {
      interval = setInterval(() => {
        if (!isAnalyzing) {
          captureAndAnalyze();
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLiveMode, isAnalyzing, mode, captureAndAnalyze]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white relative overflow-hidden font-sans">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center backdrop-blur-sm">
        <h1 className="text-lg md:text-xl font-bold text-green-400 flex items-center gap-2">
          <Zap className="fill-current w-5 h-5" /> Çiftçi AI
        </h1>

        {/* Validated Badge / Status */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isLiveMode ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
          {isLiveMode ? 'CANLI ANALİZ' : 'BEKLEMEDE'}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col bg-gray-900">

        {/* Mode: Camera */}
        {mode === 'camera' && (
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {cameraError ? (
              <div className="text-center p-8 max-w-sm mx-auto">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <p className="text-gray-300 mb-6">{cameraError}</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={startCamera} className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 font-semibold">Tekrar Dene</button>
                  <button onClick={() => setMode('upload')} className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 font-semibold">Dosya Yükle</button>
                </div>
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
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Mode: Upload */}
        {mode === 'upload' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-900">
            {uploadedImage ? (
              <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden border border-gray-700 shadow-xl">
                <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain" />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-sm aspect-square border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-800/50 transition-all group"
              >
                <Upload className="w-16 h-16 text-gray-500 group-hover:text-green-500 mb-4 transition-colors" />
                <p className="text-gray-400 font-medium group-hover:text-white">Fotoğraf Seç veya Çek</p>
                <p className="text-xs text-gray-600 mt-2">Galeriden veya Kameradan</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="p-4 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col items-center">
              <RefreshCw className="w-10 h-10 text-green-500 animate-spin mb-3" />
              <p className="text-green-400 font-bold animate-pulse">Yapay Zeka Analiz Ediyor...</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Result Card */}
      <div className="bg-gray-900 border-t border-gray-800 p-4 pb-8 z-30">
        <div className="max-w-md mx-auto">
          {analysis && (
            <div className={`p-4 rounded-xl border mb-6 transition-all duration-500 ${analysis.includes("Hazır") ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-green-900/20 border-green-500/50 text-white'}`}>
              <p className="text-sm md:text-base font-medium leading-relaxed text-center">
                {analysis}
              </p>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="flex items-center justify-between gap-4">

            {/* Mode Switcher */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setMode('camera')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'camera' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <Camera className="w-4 h-4" /> K
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'upload' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <ImageIcon className="w-4 h-4" /> Y
              </button>
            </div>

            {/* Action Button */}
            {mode === 'camera' && (
              <>
                <button
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border transition-all ${isLiveMode ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-gray-600 text-gray-400'}`}
                >
                  <RefreshCw className={`w-5 h-5 ${isLiveMode ? 'animate-spin' : ''}`} />
                </button>

                {!isLiveMode && (
                  <button
                    onClick={captureAndAnalyze}
                    disabled={isAnalyzing}
                    className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-90 transition-transform flex items-center justify-center group"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white transition-colors"></div>
                  </button>
                )}
              </>
            )}

            {mode === 'upload' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" /> Yeni Fotoğraf
              </button>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
