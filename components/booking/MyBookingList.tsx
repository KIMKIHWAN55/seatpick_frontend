"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge"; // 뱃지가 없으면 에러날 수 있음 (아래 설명 참고)

interface Reservation {
    id: number;
    spaceName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

export default function MyBookingList() {
    const { data: bookings, isLoading } = useQuery({
        queryKey: ["my-bookings"],
        queryFn: async () => {
            const res = await api.get<Reservation[]>("/api/bookings/my");
            return res.data;
        },
    });

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
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                        }`}>
              {item.status}
            </span>
                    </div>
                ))
            )}
        </div>
    );
}