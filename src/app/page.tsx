'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Tv, Smartphone, Music, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full mb-6 lg:mb-8">
              <Music className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6">
              🎤 Ứng dụng Karaoke
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Trải nghiệm karaoke tuyệt vời với đồng bộ hóa thời gian thực giữa màn hình chính và điều khiển từ xa di động
            </p>
          </div>

          {/* Mode Selection */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16">
            {/* Host Mode */}
            <div className="group bg-card border rounded-xl p-6 sm:p-8 lg:p-10 text-center hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <Tv className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4">
                🖥️ Màn hình chính
              </h2>
              <p className="text-muted-foreground mb-6 lg:mb-8 text-sm sm:text-base leading-relaxed">
                Thiết lập màn hình karaoke chính cho TV hoặc máy tính. Hiển thị video, quản lý hàng đợi và cập nhật thời gian thực.
              </p>
              <Link href="/host">
                <Button size="lg" className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold">
                  Khởi chạy màn hình chính
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Remote Mode */}
            <div className="group bg-card border rounded-xl p-6 sm:p-8 lg:p-10 text-center hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-4">
                📱 Điều khiển từ xa
              </h2>
              <p className="text-muted-foreground mb-6 lg:mb-8 text-sm sm:text-base leading-relaxed">
                Điều khiển phiên karaoke từ điện thoại của bạn. Tìm kiếm bài hát, thêm vào hàng đợi ngay lập tức và quản lý phát nhạc.
              </p>
              <Link href="/remote">
                <Button size="lg" variant="outline" className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold hover:bg-primary hover:text-primary-foreground">
                  Mở điều khiển từ xa
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="bg-muted/30 rounded-2xl p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-center mb-8 lg:mb-12">
              ✨ Tính năng
            </h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-4 lg:mb-6 group-hover:bg-primary/20 transition-colors">
                  <Music className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 lg:mb-3">🎵 Tích hợp YouTube</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Tìm kiếm và phát video karaoke trực tiếp từ YouTube với kết quả tức thì
                </p>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-4 lg:mb-6 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 lg:mb-3">⚡ Đồng bộ thời gian thực</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Đồng bộ hóa tức thì giữa màn hình chính và thiết bị di động sử dụng Supabase
                </p>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-4 lg:mb-6 group-hover:bg-primary/20 transition-colors">
                  <Tv className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 lg:mb-3">🏠 Hỗ trợ nhiều phòng</h4>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Nhiều phiên karaoke với mã phòng 4 chữ số duy nhất
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 lg:mt-16 text-center">
            <h3 className="text-2xl sm:text-3xl font-semibold text-foreground mb-6 lg:mb-8">
              🚀 Cách bắt đầu
            </h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 text-sm sm:text-base text-muted-foreground">
              <div className="bg-card border rounded-xl p-6 lg:p-8 hover:shadow-lg transition-shadow">
                <div className="text-2xl mb-3">🖥️</div>
                <div className="font-semibold text-foreground mb-3 text-lg">1. Thiết lập màn hình chính</div>
                <div className="leading-relaxed">Khởi chạy màn hình chính trên TV hoặc màn hình máy tính để mọi người xem</div>
              </div>
              <div className="bg-card border rounded-xl p-6 lg:p-8 hover:shadow-lg transition-shadow">
                <div className="text-2xl mb-3">📱</div>
                <div className="font-semibold text-foreground mb-3 text-lg">2. Tham gia bằng điện thoại</div>
                <div className="leading-relaxed">Mở điều khiển từ xa trên điện thoại và nhập mã phòng 4 chữ số</div>
              </div>
              <div className="bg-card border rounded-xl p-6 lg:p-8 hover:shadow-lg transition-shadow">
                <div className="text-2xl mb-3">🎤</div>
                <div className="font-semibold text-foreground mb-3 text-lg">3. Bắt đầu hát</div>
                <div className="leading-relaxed">Tìm kiếm bài hát, chạm để thêm ngay lập tức và thưởng thức karaoke!</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
