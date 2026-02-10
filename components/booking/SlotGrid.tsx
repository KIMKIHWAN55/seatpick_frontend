"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";

// 👇 [수정] 부모(페이지)에서 spaceId를 받아오도록 정의
interface SlotGridProps {
    spaceId: number;
    spaceName: string; // 이름도 받아오면 좋음
}

export default function SlotGrid({ spaceId, spaceName }: SlotGridProps) {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 날짜 포맷 (YYYY-MM-DD)
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // 1. 해당 공간(spaceId)의 슬롯 조회
    const { data: slots, isLoading } = useQuery({
        queryKey: ["slots", spaceId, dateStr], // 👈 키에 spaceId 포함 필수!
        queryFn: async () => {
            // API 주소에 spaceId 동적 삽입
            const res = await api.get(`/spaces/${spaceId}/slots?date=${dateStr}`);
            return res.data;
        },
    });

    // 2. 예약 요청 (Mutation)
    const bookingMutation = useMutation({
        mutationFn: async (time: string) => {
            await api.post("/bookings", {
                spaceId: spaceId, // 👈 받아온 ID 사용
                date: dateStr,
                startTime: time,
                endTime: `${parseInt(time.split(":")[0]) + 1}:00`,
            });
        },
        onSuccess: () => {
            alert("예약 성공! 🎉");
            queryClient.invalidateQueries({ queryKey: ["slots", spaceId, dateStr] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || "예약 실패 (이미 선점됨)");
        },
    });

    if (isLoading) return <div className="text-center p-10">⏳ 시간표 불러오는 중...</div>;

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 text-center">{spaceName} 예약하기</h2>

            {/* 날짜 선택기 (간단 버전) */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}>◀</button>
                <span className="font-bold text-lg">{dateStr}</span>
                <button onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}>▶</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {slots?.map((slot: any) => (
                    <button
                        key={slot.time}
                        disabled={slot.status === "BOOKED"}
                        onClick={() => {
                            if (confirm(`${slot.time}에 예약하시겠습니까?`)) {
                                bookingMutation.mutate(slot.time);
                            }
                        }}
                        className={`py-3 rounded-lg font-bold transition-colors ${
                            slot.status === "BOOKED"
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                        }`}
                    >
                        {slot.time}
                    </button>
                ))}
            </div>
        </div>
    );
}