"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Slot {
    time: string;
    status: "AVAILABLE" | "BOOKED" | "LOCKED";
}

export default function SlotGrid() {
    const queryClient = useQueryClient(); // 화면 갱신용

    // 날짜/공간 하드코딩 (나중에 바꿀 예정)
    const date = "2026-02-02";
    const spaceId = 1;

    // 1. 조회 API (GET)
    const { data: slots, isLoading } = useQuery({
        queryKey: ["slots", spaceId, date],
        queryFn: async () => {
            const response = await api.get<Slot[]>(`/spaces/${spaceId}/slots`, {
                params: { date },
            });
            return response.data;
        },
    });

    // 2. 예약 API (POST) 🔥 추가된 부분
    const bookingMutation = useMutation({
        mutationFn: async (startTime: string) => {
            // 14:00:00 -> 14:00 (시간 포맷 맞추기)
            const cleanTime = startTime.substring(0, 5);
            // 1시간 뒤 계산 (간단하게 구현)
            const endTimeHour = parseInt(cleanTime.split(":")[0]) + 1;
            const endTime = `${endTimeHour}:00`;

            return api.post("/api/bookings", {
                spaceId,
                date,
                startTime: cleanTime,
                endTime: endTime,
            });
        },
        onSuccess: () => {
            alert("성공! 자리를 찜했습니다. (5분간 유지)");
            // 화면 새로고침 없이 데이터만 다시 불러오기 (버튼 회색으로 변함)
            queryClient.invalidateQueries({ queryKey: ["slots"] });
        },
        onError: (error: any) => {
            alert("실패: " + (error.response?.data?.message || "이미 누군가 챘습니다!"));
        },
    });

    if (isLoading) return <div className="p-10 text-center">⏳ 로딩 중...</div>;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-center">📅 2월 2일 시간표</h2>

            <div className="grid grid-cols-3 gap-3">
                {slots?.map((slot) => {
                    const isAvailable = slot.status === "AVAILABLE";

                    return (
                        <Button
                            key={slot.time}
                            variant={isAvailable ? "outline" : "secondary"}
                            disabled={!isAvailable || bookingMutation.isPending} // 로딩중엔 클릭 방지
                            onClick={() => bookingMutation.mutate(slot.time)} // 👈 클릭 시 실행
                            className={cn(
                                "h-14 text-lg font-medium transition-all",
                                isAvailable
                                    ? "hover:bg-blue-50 hover:text-blue-600 border-gray-200"
                                    : "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                            )}
                        >
                            {slot.time.substring(0, 5)}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}