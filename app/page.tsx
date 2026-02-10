import SlotGrid from "@/components/booking/SlotGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md flex justify-end mb-4">
                <Link href="/my">
                    <Button>👤 내 예약 확인</Button>
                </Link>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
                SeatPick 🚀
            </h1>
            <SlotGrid />
        </main>
    );
}