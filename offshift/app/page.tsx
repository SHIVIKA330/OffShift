import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <h1 className="text-2xl font-semibold text-[#0F4C5C]">OffShift</h1>
      <p className="max-w-sm text-sm text-slate-600">
        Smart income shield for Zomato & Swiggy riders — Delhi NCR
      </p>
      <Link
        href="/onboard"
        className="rounded-xl bg-[#0F4C5C] px-6 py-3 text-sm font-medium text-white"
      >
        शुरू करें / Start onboarding
      </Link>
    </main>
  );
}
