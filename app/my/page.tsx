"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MyBookingList from "@/components/booking/MyBookingList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AxiosError } from "axios"; // 👈 AxiosError 타입을 위해 추가

export default function MyPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // 🌟 사장님 전환 핸들러
    const handleUpgrade = async () => {
        if (!confirm("사장님으로 전환하시겠습니까?\n전환 후에는 공간을 등록하고 관리할 수 있습니다.")) {
            return;
        }

        setIsLoading(true);
        try {
            // 백엔드 API 호출
            await api.post("/users/upgrade");

            alert("축하합니다! 🎉\n이제 사장님 권한으로 공간을 등록할 수 있습니다.");

            // 전환 성공 후 관리자 페이지로 바로 이동
            router.push("/admin/spaces");

        } catch (error) {
            // 👈 any를 제거하고 AxiosError로 타입 캐스팅
            const err = error as AxiosError<{ message: string }>;
            console.error(err);

            // 백엔드에서 보낸 에러 메시지가 있다면 그걸 보여주고, 없으면 기본 메시지 출력
            const errorMessage = err.response?.data?.message || "전환 신청 중 오류가 발생했습니다.";
            alert(`❌ ${errorMessage}`);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* 1. 상단 네비게이션 */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">👤 마이페이지</h1>
                    <Link href="/">
                        <Button variant="outline">🏠 메인으로</Button>
                    </Link>
                </div>

                {/* 2. 사장님 메뉴 (비즈니스 영역) */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                    <h2 className="text-lg font-bold text-blue-900 mb-2">🏢 파트너 센터</h2>
                    <p className="text-sm text-blue-700 mb-4">
                        남는 공간이 있으신가요? 사장님으로 전환하고 수익을 창출해보세요!
                    </p>
                    <div className="flex gap-2">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 flex-1"
                            onClick={handleUpgrade}
                            disabled={isLoading}
                        >
                            {isLoading ? "처리 중..." : "🚀 사장님으로 전환하기"}
                        </Button>

                        <Link href="/admin/spaces">
                            <Button variant="outline" className="bg-white">
                                🔧 관리자 페이지
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* 3. 내 예약 리스트 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-lg font-bold mb-4">📅 내 예약 내역</h2>
                    <MyBookingList />
                </div>
            </div>
        </div>
    );
}