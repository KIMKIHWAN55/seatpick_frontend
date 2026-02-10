"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSpacePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        location: "",
        type: "MEETING_ROOM", // 기본값
    });

    // 옵션 관리 (간단하게 체크박스로)
    const [options, setOptions] = useState({
        wifi: false,
        projector: false,
        monitor: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 체크된 옵션만 추려서 보냄
        const optionsToSend = Object.fromEntries(
            Object.entries(options).filter(([_, checked]) => checked)
        );

        try {
            await api.post("/spaces", {
                ...form,
                options: optionsToSend,
            });
            alert("✨ 공간 등록 완료!");
            router.push("/"); // 메인으로 이동해서 확인
        } catch (err) {
            alert("등록 실패 ㅠㅠ");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">🏢 공간 등록 (관리자)</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">공간 이름</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="예: 강남 2호점"
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">위치</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="예: 서울시 서초구..."
                            value={form.location}
                            onChange={(e) => setForm({...form, location: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">공간 타입</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={form.type}
                            onChange={(e) => setForm({...form, type: e.target.value})}
                        >
                            <option value="MEETING_ROOM">미팅룸</option>
                            <option value="STUDIO">스튜디오</option>
                            <option value="GYM">체육관</option>
                            <option value="OFFICE">오피스</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">편의 시설</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={options.wifi} onChange={(e) => setOptions({...options, wifi: e.target.checked})} />
                                WiFi
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={options.projector} onChange={(e) => setOptions({...options, projector: e.target.checked})} />
                                프로젝터
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={options.monitor} onChange={(e) => setOptions({...options, monitor: e.target.checked})} />
                                모니터
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                        등록하기
                    </button>
                </form>
            </div>
        </div>
    );
}