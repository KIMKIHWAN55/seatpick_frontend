"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import SlotGrid from "@/components/booking/SlotGrid";
import { Button } from "@/components/ui/button";

export default function SpaceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    // 공간 정보(이름) 가져오기
    const { data: space, isLoading } = useQuery({
        queryKey: ["space", id],
        queryFn: async () => {
            const res = await api.get(`/spaces/${id}`);
            return res.data;
        },
    });

    if (isLoading) return <div className="min-h-screen flex justify-center items-center">⏳ 로딩 중...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            {/* 상단 네비게이션 */}
            <div className="w-full max-w-lg flex justify-start mb-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    ← 뒤로가기
                </Button>
            </div>

            {/* 시간표 컴포넌트 (여기서 조립!) */}
            {space && (
                <SlotGrid spaceId={id} spaceName={space.name} />
            )}
        </div>
    );
}