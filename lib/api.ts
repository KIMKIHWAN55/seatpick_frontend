import axios from "axios";

// 1. 전용 Axios 인스턴스 생성
const api = axios.create({
    baseURL: "/api", // Next.js 프록시를 타도록 설정
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. 요청 가로채기 (Interceptor)
api.interceptors.request.use(
    (config) => {
        // 브라우저 저장소에서 토큰 꺼내기
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        // 토큰이 있으면 헤더에 'Bearer 토큰' 형태로 붙이기
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;