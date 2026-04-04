import Link from "next/link";
import { Suspense } from "react";
import { PayoutSuccessClient } from "@/components/payout-success/payout-client";

export const dynamic = "force-dynamic";

export default function PayoutSuccessPage() {
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9f7] dark:bg-stone-950 backdrop-blur-md opacity-90 flex justify-between items-center px-6 py-4">
        <Link href="/">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#3A4D39] dark:text-[#A7B4A6] hover:opacity-70 transition-opacity duration-300 ease-in-out cursor-pointer" data-icon="menu">menu</span>
            <h1 className="text-2xl font-semibold tracking-tighter text-[#3A4D39] dark:text-[#f9f9f7] font-['Newsreader']">OffShift</h1>
          </div>
        </Link>
        <Link href="/dashboard">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/15 flex items-center justify-center overflow-hidden hover:opacity-70 transition-opacity duration-300 ease-in-out cursor-pointer">
            <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC95G_7XgTmO5BqUuzbpLEgXc7-4kMwgCwl1NZw8mlK-DYoiUVWMcs8CASgIcEn4bniG4AFJQPWeNnEaea2aFik8TwfLAgBfIYYlBRzLUQ4o6KSF_NIedBXY5gsc2wPRlxD5468OoFmFIWauikoZ8utGhQ5RzulaTjDTz3wVw6E3yv4VoWMS77huuVwTAm0tIBzuqrglIPdMrl_rd4e6eHeCTOGkh98SQ9tAlSWlW5zVJnwhw3GinFy5WantT8l860hX3GbCv0Owww"/>
          </div>
        </Link>
      </header>

      <main className="pt-24 pb-32 px-6 min-h-screen bg-surface">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest animate-pulse">Loading payout details...</p>
          </div>
        }>
          <PayoutSuccessClient />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-on-primary-fixed-variant pt-20 pb-40 px-8">
        <div className="max-w-md mx-auto">
          <h2 className="font-headline text-4xl text-on-primary mb-8 tracking-tighter">OffShift</h2>
          <div className="grid grid-cols-2 gap-12 mb-16">
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-primary/50">Explore</h4>
              <a className="text-sm font-body hover:text-on-primary transition-colors" href="#">How it works</a>
              <a className="text-sm font-body hover:text-on-primary transition-colors" href="#">Plans</a>
              <a className="text-sm font-body hover:text-on-primary transition-colors" href="#">Stories</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-primary/50">Company</h4>
              <a className="text-sm font-body hover:text-on-primary transition-colors" href="#">Privacy</a>
              <a className="text-sm font-body hover:text-on-primary transition-colors" href="#">Terms</a>
              <a className="text-sm font-body hover:text-on-primary transition-colors" href="#">Help</a>
            </div>
          </div>
          <div className="pt-8 border-t border-on-primary/10 flex flex-col gap-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container" data-icon="verified">verified</span>
              </div>
              <p className="text-xs font-body text-on-primary/60 leading-relaxed">
                  Underwritten by Meridian Global Assurance. Licensed parametric insurance provider.
              </p>
            </div>
            <p className="text-[10px] font-label text-on-primary/40 text-center uppercase tracking-widest">
                © 2024 OffShift Technologies Pvt Ltd.
            </p>
          </div>
        </div>
      </footer>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-8 bg-[#f9f9f7]/80 dark:bg-stone-900/80 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.06)] rounded-t-[32px]">
        <Link href="/">
          <div className="flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 p-2 hover:text-[#3A4D39] dark:hover:text-white transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined mb-1" data-icon="home_app_logo">home_app_logo</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Home</span>
          </div>
        </Link>
        <Link href="/dashboard">
          <div className="flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 p-2 hover:text-[#3A4D39] dark:hover:text-white transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined mb-1" data-icon="verified_user">verified_user</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Policies</span>
          </div>
        </Link>
        <Link href="/payout-success">
          <div className="flex flex-col items-center justify-center bg-[#3A4D39] text-white dark:bg-[#3A4D39] dark:text-[#f9f9f7] rounded-full px-5 py-2 scale-95 duration-200 cursor-pointer">
            <span className="material-symbols-outlined mb-1" data-icon="request_quote">request_quote</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Claims</span>
          </div>
        </Link>
        <Link href="/dashboard">
          <div className="flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 p-2 hover:text-[#3A4D39] dark:hover:text-white transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined mb-1" data-icon="account_circle">account_circle</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Profile</span>
          </div>
        </Link>
      </nav>
    </>
  );
}
