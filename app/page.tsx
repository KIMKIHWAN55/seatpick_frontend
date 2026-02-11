"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Space {
    id: number;
    name: string;
    location: string;
    type: string;
}

export default function Home() {
    const GOOGLE_LOGIN_URL = "http://localhost:8080/oauth2/authorization/google";
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
        alert("로그아웃 되었습니다.");
    };

    const { data: spaces } = useQuery({
        queryKey: ["spaces"],
        queryFn: async () => {
            const res = await api.get<Space[]>("/spaces");
            return res.data;
        }
    });

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 mt-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    SeatPick 🚀
                </h1>

                <div className="flex gap-2">
                    {isLoggedIn ? (
                        <>
                            <Link href="/my">
                                <Button>👤 내 예약</Button>
                            </Link>
                            <Button variant="outline" onClick={handleLogout}>
                                로그아웃
                            </Button>
                        </>
                    ) : (
                        <Link href={GOOGLE_LOGIN_URL}>
                            <Button variant="outline" className="flex gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                구글 로그인
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">🏠 예약 가능한 공간</h2>

                {spaces && spaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {spaces.map((space) => (
                            <div key={space.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{space.name}</h3>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                        {space.type}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mb-4">📍 {space.location}</p>

                                <Link href={`/spaces/${space.id}`}>
                                    <Button className="w-full mt-2" variant="secondary">
                                        예약하기
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <p className="text-gray-500">등록된 공간이 없습니다.</p>
                    </div>
                )}

                {/* 👇 여기! 리스트 아래에 항상 보이도록 추가했습니다 */}
                <div className="mt-10 text-center border-t pt-6">
                    <Link href="/admin/spaces" className="text-gray-400 text-sm hover:text-gray-600 underline">
                        🔧 (관리자) 새 공간 등록하러 가기
                    </Link>
                </div>
            </div>
        </main>
    );
}