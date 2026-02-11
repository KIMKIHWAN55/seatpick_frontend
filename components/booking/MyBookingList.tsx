"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query"; // 👈 useQueryClient 추가
import api from "@/lib/api";

interface Reservation {
    id: number;
    spaceName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

export default function MyBookingList() {
    const queryClient = useQueryClient(); // 👈 리스트 새로고침용

    const { data: bookings, isLoading } = useQuery({
        queryKey: ["my-bookings"],
        queryFn: async () => {
            const res = await api.get<Reservation[]>("/bookings/my");
            return res.data;
        },
    });

    // 👇 취소 핸들러 함수
    const handleCancel = async (id: number) => {
        if (!confirm("정말 예약을 취소하시겠습니까?")) return;

        try {
            await api.post(`/bookings/${id}/cancel`);
            alert("취소되었습니다.");
            // 리스트 새로고침 (다시 불러오기)
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        } catch (error) {
            alert("취소에 실패했습니다.");
        }
    };

    if (isLoading) return <div>⏳ 불러오는 중...</div>;

    return (
        <div className="max-w-md mx-auto mt-6 space-y-4">
            <h2 className="text-xl font-bold">🎟️ 내 예약 내역</h2>

            {bookings?.length === 0 ? (
                <p className="text-gray-500 text-center py-10">아직 예약이 없습니다.</p>
            ) : (
                bookings?.map((item) => (
                    <div key={item.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-lg">{item.spaceName}</h3>
                            <p className="text-gray-600">
                                {item.date} {item.startTime.substring(0, 5)} ~ {item.endTime.substring(0, 5)}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {/* 1. 상태 뱃지 (Status Badge) */}
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    item.status === "CONFIRMED"
                                        ? "bg-green-100 text-green-700"
                                        : item.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : item.status === "CANCELLED"
                                                ? "bg-red-100 text-red-700"
                                                : item.status === "COMPLETED"
                                                    ? "bg-gray-200 text-gray-600" // 👈 이용완료 (회색)
                                                    : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {/* 영어 상태값을 한글로 변환 */}
                                {item.status === "CANCELLED"
                                    ? "취소됨"
                                    : item.status === "COMPLETED"
                                        ? "이용완료"
                                        : item.status === "CONFIRMED"
                                            ? "예약확정"
                                            : item.status}
                            </span>

                            {/* 2. 예약 취소 버튼 (취소됨, 이용완료가 아닐 때만 보임) */}
                            {item.status !== "CANCELLED" && item.status !== "COMPLETED" && (
                                <button
                                    onClick={() => handleCancel(item.id)}
                                    className="ml-2 text-xs text-red-500 underline hover:text-red-700"
                                >
                                    예약 취소
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}