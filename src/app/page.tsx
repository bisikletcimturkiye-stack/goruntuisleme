'use client';

import { Activity, Tractor, ScanEye, LayoutDashboard, Database, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Hero Section */}
      <div className="relative h-[40vh] flex items-center justify-center bg-gradient-to-br from-blue-900/40 via-slate-900 to-orange-900/20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
        <div className="text-center z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight flex items-center justify-center gap-3">
            <Tractor size={48} className="text-orange-500" />
            GORUNTUISLEME <span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Endüstriyel Hayvan Besleme ve Yem Karma Takip Sistemi.
            AI destekli analiz ve gerçek zamanlı kantar entegrasyonu.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto p-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Action Card: Detailed Dashboard */}
          <Link href="/dashboard" className="group bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-blue-500 transition-all shadow-2xl flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="text-blue-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Yönetim Paneli</h2>
              <p className="text-slate-400">Veteriner rasyon takibi, kantar verileri ve anlık besleme grafiklerine ulaşın.</p>
            </div>
            <div className="text-blue-400 font-bold flex items-center gap-2 mt-4">
              Giriş Yap <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Action Card: AI Scanner (Internal Link/Component future) */}
          <div className="group bg-slate-800 p-8 rounded-3xl border border-slate-700 opacity-60 cursor-not-allowed min-h-[280px] flex flex-col justify-between">
            <div>
              <div className="bg-green-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <ScanEye className="text-green-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Canlı Tarayıcı</h2>
              <p className="text-slate-400">Kamera üzerinden anlık yem tespiti ve kalite kontrol modülü.</p>
            </div>
            <div className="text-slate-500 font-bold italic">
              Hardware Bağlantısı Bekleniyor...
            </div>
          </div>

          {/* Action Card: Database / Config */}
          <div className="group bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-orange-500 transition-all shadow-2xl min-h-[280px] flex flex-col justify-between">
            <div>
              <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="text-orange-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sistem Ayarları</h2>
              <p className="text-slate-400">Donanım kalibrasyonu, .env yapılandırması ve kullanıcı yetkilendirme.</p>
            </div>
            <div className="text-orange-400 font-bold flex items-center gap-2 mt-4">
              Yapılandır <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

        </div>

        {/* Quick Stats Summary */}
        <div className="mt-12 bg-slate-800/50 rounded-3xl border border-slate-800 p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="text-slate-400" size={18} />
            Sistem Durum Özeti
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Bağlı Cihazlar</p>
              <p className="text-2xl font-bold text-white">4 Aktif</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Günlük Analiz</p>
              <p className="text-2xl font-bold text-white">1,240</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Rasyon Başarısı</p>
              <p className="text-2xl font-bold text-green-500">%98.2</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Veteriner Onayı</p>
              <p className="text-2xl font-bold text-blue-500">GÜNCEL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 p-8 text-center text-slate-600 text-sm border-t border-slate-800">
        <p>© 2026 Hayvan Besleme Takip Sistemi - Endüstriyel Çözüm</p>
      </footer>
    </main>
  );
}
