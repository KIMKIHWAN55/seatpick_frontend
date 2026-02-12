"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { AxiosError } from "axios"; // 👈 추가

// 👇 포트원 결제 응답 객체 타입 정의
interface IamportResponse {
    success: boolean;
    error_msg?: string;
    merchant_uid: string;
    imp_uid?: string;
    [key: string]: any; // 기타 필드 허용
}

declare global {
    interface Window {
        IMP: any;
    }
}

// 👇 슬롯 데이터 타입 정의
interface Slot {
    time: string;
    status: "AVAILABLE" | "BOOKED";
}

interface SlotGridProps {
    spaceId: number;
    spaceName: string;
}

export default function SlotGrid({ spaceId, spaceName }: SlotGridProps) {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // 1. 슬롯 조회
    const { data: slots, isLoading } = useQuery<Slot[]>({
        queryKey: ["slots", spaceId, dateStr],
        queryFn: async () => {
            const res = await api.get(`/spaces/${spaceId}/slots?date=${dateStr}`);
            return res.data;
        },
    });

    // 2. 백엔드 예약 요청
    const bookingMutation = useMutation({
        mutationFn: async (time: string) => {
            await api.post("/bookings", {
                spaceId: spaceId,
                date: dateStr,
                startTime: time,
                endTime: `${parseInt(time.split(":")[0]) + 1}:00`,
            });
        },
        onSuccess: () => {
            alert("✅ 예약 및 결제가 완료되었습니다!");
            queryClient.invalidateQueries({ queryKey: ["slots", spaceId, dateStr] });
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        },
        onError: (err: AxiosError<{ message: string }>) => { // 👈 any 제거
            alert(err.response?.data?.message || "예약 처리에 실패했습니다. 관리자에게 문의하세요.");
        },
    });

    // 3. 결제 함수
    const handlePayment = (time: string) => {
        if (!window.IMP) {
            alert("결제 모듈을 불러오지 못했습니다. 새로고침 해주세요.");
            return;
        }

        const { IMP } = window;
        IMP.init("imp28478251");

        const amount = 100;

        IMP.request_pay(
            {
                pg: "tosspayments",
                pay_method: "card",
                merchant_uid: `mid_${new Date().getTime()}`,
                name: `${spaceName} - ${time} 예약`,
                amount: amount,
                buyer_email: "test@example.com",
                buyer_name: "홍길동",
                buyer_tel: "010-1234-5678",
            },
            (rsp: IamportResponse) => { // 👈 any 제거
                if (rsp.success) {
                    console.log("결제 성공", rsp);
                    bookingMutation.mutate(time);
                } else {
                    alert(`결제에 실패하였습니다. (${rsp.error_msg})`);
                }
            }
        );
    };

    if (isLoading) return <div className="text-center p-10">⏳ 시간표 불러오는 중...</div>;

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 text-center">{spaceName} 예약하기</h2>

            <div className="flex justify-between items-center mb-6 bg-gray-50 p-2 rounded-lg">
                <button
                    onClick={() => {
                        const prev = new Date(selectedDate);
                        prev.setDate(selectedDate.getDate() - 1);
                        setSelectedDate(prev);
                    }}
                    className="px-3 py-1 hover:bg-gray-200 rounded"
                >
                    ◀
                </button>
                <span className="font-bold text-lg">{dateStr}</span>
                <button
                    onClick={() => {
                        const next = new Date(selectedDate);
                        next.setDate(selectedDate.getDate() + 1);
                        setSelectedDate(next);
                    }}
                    className="px-3 py-1 hover:bg-gray-200 rounded"
                >
                    ▶
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {slots?.map((slot: Slot) => ( // 👈 any 제거
                    <button
                        key={slot.time}
                        disabled={slot.status === "BOOKED"}
                        onClick={() => {
                            if (confirm(`${slot.time}에 예약하시겠습니까? (결제창이 뜹니다)`)) {
                                handlePayment(slot.time);
                            }
                        }}
                        className={`py-3 rounded-lg font-bold transition-colors ${
                            slot.status === "BOOKED"
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md"
                        }`}
                    >
                        {slot.time}
                    </button>
                ))}
            </div>
        </div>
    );
}