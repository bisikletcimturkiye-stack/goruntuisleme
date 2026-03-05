"use client";

import React, { useState, useEffect } from "react";
import { Activity, Tractor, AlertTriangle, CheckCircle } from "lucide-react";

// Mock data for the dashboard
const MOCK_LOGS = [
    { id: 1, type: "Mısır Silajı", weight: 450, target: 500, status: "partial", time: "18:20" },
    { id: 2, type: "Yonca", weight: 120, target: 100, status: "over", time: "18:25" },
    { id: 3, type: "Arpa", weight: 80, target: 80, status: "exact", time: "18:30" },
    { id: 4, type: "Fabrika Yemi", weight: 50, target: 50, status: "exact", time: "18:35" },
];

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <header className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Tractor className="text-orange-500" />
                        Yem Karma Takip Sistemi
                    </h1>
                    <p className="text-slate-400 mt-1">Veteriner & İşletme Takip Paneli</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                        <Activity className="text-green-400" />
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Cihaz Durumu</p>
                            <p className="text-sm font-semibold text-green-400 underline decoration-green-900">ÇEVRİMİÇİ (Mikser-1)</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Real-time Feed Logs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Activity className="text-blue-400" size={20} />
                            Anlık Besleme Akışı
                        </h2>
                        <div className="space-y-4">
                            {MOCK_LOGS.map((log) => (
                                <div key={log.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${log.status === 'exact' ? 'bg-green-500/10 text-green-500' :
                                            log.status === 'over' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {log.status === 'exact' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{log.type}</p>
                                            <p className="text-sm text-slate-500">Saat: {log.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-mono font-bold">{log.weight} kg</p>
                                        <p className="text-xs text-slate-500">Hedef: {log.target} kg</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl min-h-[400px]">
                        <h2 className="text-xl font-semibold mb-6">Rasyon Karşılaştırma Analizi</h2>
                        <div className="space-y-6">
                            {MOCK_LOGS.map((log) => {
                                const percentage = Math.min((log.weight / log.target) * 100, 100);
                                return (
                                    <div key={log.id}>
                                        <div className="flex justify-between mb-2 text-sm">
                                            <span className="text-slate-400">{log.type}</span>
                                            <span className="text-slate-300 font-mono">{log.weight} / {log.target} kg</span>
                                        </div>
                                        <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 flex">
                                            <div
                                                className={`h-full transition-all duration-1000 ${log.status === 'exact' ? 'bg-blue-500' :
                                                    log.status === 'over' ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Summaries & Controls */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/10 rounded-2xl p-6 border border-orange-500/20 shadow-xl">
                        <h2 className="text-lg font-bold text-orange-400 mb-4">Veteriner Notu</h2>
                        <p className="text-slate-300 italic">
                            "Süt hayvanları rasyonu için silaj miktarını %5 artırdım. Kantar hassasiyetine dikkat edilsin."
                        </p>
                        <button className="mt-4 w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all">
                            Yeni Rasyon Gönder
                        </button>
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                        <h2 className="text-lg font-semibold mb-4">Sistem İstatistikleri</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold">%94</p>
                                <p className="text-xs text-slate-500">Rasyon Uyumu</p>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl text-center">
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-xs text-slate-500">Günlük Sefer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
