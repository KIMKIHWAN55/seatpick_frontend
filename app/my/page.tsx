"use client";

import MyBookingList from "@/components/booking/MyBookingList"; // 👈 아까 만든 리스트 컴포넌트 가져오기
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                {/* 상단 네비게이션 */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">👤 마이페이지</h1>
                    <Link href="/">
                        <Button variant="outline">🏠 메인으로</Button>
                    </Link>
                </div>

                {/* 👇 여기가 핵심! 예약 리스트 컴포넌트 보여주기 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <MyBookingList />
                </div>
            </div>
        </div>
    );
}