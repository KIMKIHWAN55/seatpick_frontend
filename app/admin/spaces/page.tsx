"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminSpacesPage() {
    const queryClient = useQueryClient();

    // 수정 중인 공간 ID (null이면 생성 모드, 숫자가 있으면 수정 모드)
    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: "",
        location: "",
        type: "MEETING_ROOM",
        imageUrl: "",
    });

    // 1. 목록 조회
    const { data: spaces } = useQuery({
        queryKey: ["admin-spaces"],
        queryFn: async () => {
            const res = await api.get("/spaces");
            return res.data;
        },
    });

    // 2. 등록 (Create)
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

    // 3. 수정 (Update) - 새로 추가됨!
    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!editingId) return;
            await api.put(`/spaces/${editingId}`, { ...form, options: {} });
        },
        onSuccess: () => {
            alert("✨ 수정 완료!");
            resetForm(); // 수정 끝나면 다시 생성 모드로 복귀
            queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
        },
    });

    // 4. 삭제 (Delete)
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/spaces/${id}`);
        },
        onSuccess: () => {
            alert("🗑️ 삭제되었습니다.");
            queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
        },
        onError: (err: any) => {
            let message = "삭제 중 오류가 발생했습니다.";

            // 1. 백엔드가 문자열로 보냈을 때 (우리가 만든 GlobalExceptionHandler)
            if (typeof err.response?.data === "string") {
                message = err.response.data;
            }
            // 2. 스프링 기본 에러(JSON)로 왔을 때
            else if (err.response?.data?.message) {
                message = err.response.data.message;
            }
            // 3. 진짜 알 수 없는 객체일 때
            else {
                message = JSON.stringify(err.response?.data || "알 수 없는 오류");
            }

            alert(`❌ ${message}`);
        },
    });

    // 폼 초기화 함수
    const resetForm = () => {
        setForm({ name: "", location: "", type: "MEETING_ROOM", imageUrl: "" });
        setEditingId(null); // 수정 모드 해제
    };

    // 수정 버튼 눌렀을 때 폼에 데이터 채우기
    const handleEditClick = (space: any) => {
        setEditingId(space.id);
        setForm({
            name: space.name,
            location: space.location,
            type: space.type,
            imageUrl: space.imageUrl || "",
        });
        // 스크롤을 맨 위로 올려서 폼 보여주기
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">🔧 관리자 페이지 (공간 관리)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* 왼쪽: 입력 폼 (생성/수정 공용) */}
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

                        {/* 버튼이 상황에 따라 바뀜 */}
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

                {/* 오른쪽: 리스트 */}
                <div className="bg-gray-50 p-6 rounded-xl border">
                    <h2 className="text-lg font-bold mb-4">📋 등록된 공간 목록</h2>
                    <div className="space-y-3">
                        {spaces?.map((space: any) => (
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