import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers"; //
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SeatPick",
    description: "공간 예약 플랫폼",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {/* 👇 Providers로 감싸서 React Query 사용 가능하게 함 */}
        <Providers>
            {children}
        </Providers>
        {/* 👇 2. 포트원(아임포트) 결제 스크립트 추가 */}
        {/* strategy="afterInteractive": 페이지 로드가 끝난 후 스크립트를 불러와서 속도를 저하시키지 않음 */}
        <Script
            src="https://cdn.iamport.kr/v1/iamport.js"
            strategy="afterInteractive"
        />
        </body>
        </html>
    );
}