/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*", // 프론트에서 /api/... 로 요청하면
                destination: "http://localhost:8080/api/:path*", // 백엔드 8080포트로 보냄
            },
        ];
    },
};

export default nextConfig;