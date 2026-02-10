"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // 1. URL에 있는 토큰 꺼내기
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (accessToken && refreshToken) {
            // 2. 브라우저 저장소(LocalStorage)에 저장
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            alert("로그인 성공! 🎉");
            router.push("/"); // 메인 페이지로 이동
        } else {
            alert("로그인 실패.. 다시 시도해주세요.");
            router.push("/");
        }
    }, [searchParams, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-xl font-bold animate-pulse">
                🚀 로그인 처리 중입니다...
            </div>
        </div>
    );
}