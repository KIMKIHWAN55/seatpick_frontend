"use client";

import { useEffect, useState } from "react"; // 👈 useEffect 추가
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";

interface Space {
    id: number;
    name: string;
    location: string;
    type: string;
    imageUrl?: string;
}

export default function AdminSpacesPage() {
    const queryClient = useQueryClient();

    // 1. 하이드레이션 에러 방지용 state
    const [mounted, setMounted] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        name: "",
        location: "",
        type: "MEETING_ROOM",
        imageUrl: "",
    });

    // 2. 컴포넌트가 브라우저에 "진짜로" 떴는지 확인
    useEffect(() => {
        setMounted(true);
    }, []);

    // 3. 목록 조회 (enabled 옵션 추가: 브라우저일 때만 실행)
    const { data: spaces, isLoading } = useQuery<Space[]>({
        queryKey: ["admin-spaces"],
        queryFn: async () => {
            const res = await api.get("/spaces/managed");
            return res.data;
        },
        enabled: mounted, // 👈 중요! 브라우저가 준비되었을 때만 API 호출
    });

    // 등록 Mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            await api.post("/spaces", { ...form, options: {} });
        },
        onSuccess: () => {
            alert("✅ 등록 완료!");
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
        },
    });

    // 수정 Mutation
    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!editingId) return;
            await api.put(`/spaces/${editingId}`, { ...form, options: {} });
        },
        onSuccess: () => {
            alert("✨ 수정 완료!");
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
        },
    });

    // 삭제 Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/spaces/${id}`);
        },
        onSuccess: () => {
            alert("🗑️ 삭제되었습니다.");
            queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
        },
        onError: (err: AxiosError<{ message: string }>) => {
            let message = "삭제 중 오류가 발생했습니다.";
            if (typeof err.response?.data === "string") {
                message = err.response.data;
            } else if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            alert(`❌ ${message}`);
        },
    });

    const resetForm = () => {
        setForm({ name: "", location: "", type: "MEETING_ROOM", imageUrl: "" });
        setEditingId(null);
    };

    const handleEditClick = (space: Space) => {
        setEditingId(space.id);
        setForm({
            name: space.name,
            location: space.location,
            type: space.type,
            imageUrl: space.imageUrl || "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 4. 서버 렌더링 중이거나 로딩 중일 때 처리 (Hydration 에러 방지)
    if (!mounted) return <div className="p-10 text-center">로딩 준비 중...</div>;
    if (isLoading) return <div className="p-10 text-center">데이터를 불러오는 중...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">🔧 관리자 페이지 (공간 관리)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* 왼쪽: 입력 폼 */}
                <div className={`p-6 rounded-xl border shadow-sm h-fit transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                        {editingId ? "✏️ 공간 수정 모드" : "✨ 새 공간 등록"}
                        {editingId && (
                            <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs text-gray-500">
                                취소하고 등록하기
                            </Button>
                        )}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">공간 이름</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                placeholder="예: 강남 1호점"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">위치</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={form.location}
                                onChange={(e) => setForm({...form, location: e.target.value})}
                                placeholder="예: 서울시 강남구..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">이미지 URL</label>
                            <input
                                className="w-full p-2 border rounded text-sm"
                                placeholder="https://..."
                                value={form.imageUrl}
                                onChange={(e) => setForm({...form, imageUrl: e.target.value})}
                            />
                        </div>

                        {editingId ? (
                            <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700" onClick={() => updateMutation.mutate()}>
                                수정 완료
                            </Button>
                        ) : (
                            <Button className="w-full mt-2" onClick={() => createMutation.mutate()}>
                                등록하기
                            </Button>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 목록 */}
                <div className="bg-gray-50 p-6 rounded-xl border">
                    <h2 className="text-lg font-bold mb-4">📋 등록된 공간 목록</h2>
                    <div className="space-y-3">
                        {spaces?.map((space) => (
                            <div key={space.id} className={`bg-white p-4 rounded-lg border flex justify-between items-center shadow-sm ${editingId === space.id ? 'ring-2 ring-blue-500' : ''}`}>
                                <div>
                                    <h3 className="font-bold">{space.name}</h3>
                                    <p className="text-xs text-gray-500">{space.location}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditClick(space)}
                                    >
                                        수정
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            if(confirm(`'${space.name}'을(를) 삭제하시겠습니까?`)) {
                                                deleteMutation.mutate(space.id);
                                            }
                                        }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {!spaces?.length && <p className="text-center text-gray-400 py-10">등록된 공간이 없습니다.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}