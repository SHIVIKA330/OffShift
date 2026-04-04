import Link from "next/link";

export default function HomePage() {
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
            <img alt="Profile" className="w-full h-full object-cover" data-alt="close-up portrait of a professional driver smiling, soft natural morning light, cinematic editorial style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC95G_7XgTmO5BqUuzbpLEgXc7-4kMwgCwl1NZw8mlK-DYoiUVWMcs8CASgIcEn4bniG4AFJQPWeNnEaea2aFik8TwfLAgBfIYYlBRzLUQ4o6KSF_NIedBXY5gsc2wPRlxD5468OoFmFIWauikoZ8utGhQ5RzulaTjDTz3wVw6E3yv4VoWMS77huuVwTAm0tIBzuqrglIPdMrl_rd4e6eHeCTOGkh98SQ9tAlSWlW5zVJnwhw3GinFy5WantT8l860hX3GbCv0Owww"/>
          </div>
        </Link>
      </header>

      <main className="pt-16 pb-32">
        {/* Hero Section */}
        <section className="relative px-6 pt-12 pb-24 overflow-hidden">
          <div className="mb-12 relative h-[442px] min-h-[400px] w-full rounded-[40px] overflow-hidden organic-hero-mask">
            <img 
              src="/hero.mp4.jpg" 
              alt="OffShift Delivery Partner" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 text-center max-w-lg mx-auto">
            <p className="font-label text-[11px] uppercase tracking-[0.2em] text-secondary mb-4">The Curated Sanctuary</p>
            <h2 className="font-headline text-5xl md:text-6xl font-medium tracking-tight leading-[1.1] text-on-surface mb-6">
                Protection for your path.
            </h2>
            <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-10 max-w-sm mx-auto">
                Parametric income insurance for the modern gig fleet. Instant payouts on rain or app outages.
            </p>
            <Link href="/onboard">
              <button className="bg-primary text-on-primary px-10 py-5 rounded-full font-label text-sm font-semibold tracking-wide editorial-shadow hover:scale-105 transition-transform duration-300">
                  Get Covered
              </button>
            </Link>
          </div>
        </section>

        {/* Logistics of Protection */}
        <section className="px-8 py-20 bg-surface-container-low">
          <div className="max-w-md mx-auto">
            <div className="flex flex-col gap-16 relative">
              {/* Step 1 */}
              <div className="flex gap-8 items-start relative z-10">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center editorial-shadow">
                  <span className="material-symbols-outlined text-primary" data-icon="notifications_active">notifications_active</span>
                </div>
                <div>
                  <h3 className="font-headline text-2xl mb-2 italic">1. Smart Alerts</h3>
                  <p className="font-body text-on-surface-variant text-sm leading-relaxed">We monitor weather patterns and server uptime in real-time. When conditions shift, you're the first to know.</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex gap-8 items-start relative z-10">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center editorial-shadow">
                  <span className="material-symbols-outlined text-primary" data-icon="touch_app">touch_app</span>
                </div>
                <div>
                  <h3 className="font-headline text-2xl mb-2 italic">2. Single-tap activation</h3>
                  <p className="font-body text-on-surface-variant text-sm leading-relaxed">No complex forms. Activate your coverage with a single gesture as you start your shift.</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex gap-8 items-start relative z-10">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center editorial-shadow">
                  <span className="material-symbols-outlined text-primary" data-icon="bolt" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <div>
                  <h3 className="font-headline text-2xl mb-2 italic">3. Instant ₹500 payout</h3>
                  <p className="font-body text-on-surface-variant text-sm leading-relaxed">Parametric triggers mean no claims process. Funds are released instantly to your wallet.</p>
                </div>
              </div>
              {/* Vertical Line Connector */}
              <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-outline-variant/30 -z-0"></div>
            </div>
          </div>
        </section>

        {/* Coverage Plans */}
        <section className="px-6 py-24">
          <h2 className="font-headline text-4xl text-center mb-16">Choose your rhythm</h2>
          <div className="flex flex-col gap-8">
            {/* Shift Pass */}
            <div className="bg-surface-container-lowest p-8 rounded-[32px] editorial-shadow border border-outline-variant/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline text-2xl font-medium">Shift Pass</h3>
                  <p className="font-body text-sm text-on-surface-variant">Best for occasional riders</p>
                </div>
                <div className="text-right">
                  <span className="font-headline text-2xl">₹49</span>
                  <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">/shift</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-body">
                  <span className="material-symbols-outlined text-secondary text-lg" data-icon="check_circle">check_circle</span>
                  Rain protection
                </li>
                <li className="flex items-center gap-3 text-sm font-body">
                  <span className="material-symbols-outlined text-secondary text-lg" data-icon="check_circle">check_circle</span>
                  Platform outage cover
                </li>
              </ul>
              <button className="w-full py-4 rounded-full border border-primary text-primary font-label text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300">Select Plan</button>
            </div>

            {/* Weekly Pass */}
            <div className="bg-primary p-8 rounded-[32px] editorial-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Popular</span>
              </div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline text-2xl font-medium text-on-primary">Weekly Pass</h3>
                  <p className="font-body text-sm text-on-primary/70">For the daily grinders</p>
                </div>
                <div className="text-right">
                  <span className="font-headline text-2xl text-on-primary">₹249</span>
                  <p className="text-[10px] uppercase tracking-tighter text-on-primary/70">/week</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-body text-on-primary">
                  <span className="material-symbols-outlined text-secondary-fixed text-lg" data-icon="check_circle">check_circle</span>
                  All Shift Pass benefits
                </li>
                <li className="flex items-center gap-3 text-sm font-body text-on-primary">
                  <span className="material-symbols-outlined text-secondary-fixed text-lg" data-icon="check_circle">check_circle</span>
                  Priority support
                </li>
              </ul>
              <button className="w-full py-4 rounded-full bg-surface-container-lowest text-primary font-label text-xs font-bold uppercase tracking-widest">Select Plan</button>
            </div>

            {/* Monthly Pro */}
            <div className="bg-surface-container-lowest p-8 rounded-[32px] editorial-shadow border border-outline-variant/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-headline text-2xl font-medium">Monthly Pro</h3>
                  <p className="font-body text-sm text-on-surface-variant">The ultimate safety net</p>
                </div>
                <div className="text-right">
                  <span className="font-headline text-2xl">₹899</span>
                  <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant">/month</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-body">
                  <span className="material-symbols-outlined text-secondary text-lg" data-icon="check_circle">check_circle</span>
                  Unlimited coverage events
                </li>
                <li className="flex items-center gap-3 text-sm font-body">
                  <span className="material-symbols-outlined text-secondary text-lg" data-icon="check_circle">check_circle</span>
                  Health insurance add-on
                </li>
              </ul>
              <button className="w-full py-4 rounded-full border border-primary text-primary font-label text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300">Select Plan</button>
            </div>
          </div>
        </section>

        {/* Rider Stories */}
        <section className="px-6 py-20 bg-surface">
          <div className="max-w-md mx-auto">
            <h2 className="font-headline text-3xl mb-12 text-center">Words from the road</h2>
            <div className="space-y-12">
              <blockquote className="relative">
                <span className="material-symbols-outlined text-primary/10 absolute -top-8 -left-4 text-7xl" data-icon="format_quote">format_quote</span>
                <p className="font-headline text-xl italic leading-relaxed text-on-surface relative z-10 mb-6">
                    &quot;Last Tuesday the storm was heavy. My app went dead. Within 20 minutes, ₹500 was in my account. OffShift changed how I work.&quot;
                </p>
                <footer className="flex items-center gap-4">
                  <img alt="Rider" className="w-10 h-10 rounded-full object-cover" data-alt="close-up profile of a young man wearing a helmet and rain gear, soft rain in the background, muted tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQa51NgjrR5p37UUguqXWt5SObsk5JP9OiuBhx7Q874tt_bU2pmZIpbJ66jksvTs5NQIhvdaEsXyCoxgeT_TQDZbDTAvxXeqJ-o6tQ5rhGfEq_mJihdTruEkAV9FasjbKtygFvaTpdyvtZBOubhoxHMD8Txpr6iwx5xWYp09fdfctOvgFSf7Y_Vbo1cxP6qBSrkNF2vjHHcbEboEFCGqxciUlF6fmvgv_PclAWoKG9BWhkwqUuRm10542PQVgDeLEckpZFKmtv5eA"/>
                  <div>
                    <cite className="font-label text-sm font-bold not-italic">Arjun Mehta</cite>
                    <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Delivery Partner, Bengaluru</p>
                  </div>
                </footer>
              </blockquote>
              <blockquote className="relative">
                <span className="material-symbols-outlined text-primary/10 absolute -top-8 -left-4 text-7xl" data-icon="format_quote">format_quote</span>
                <p className="font-headline text-xl italic leading-relaxed text-on-surface relative z-10 mb-6">
                    &quot;Peace of mind is worth every rupee. I don't check the weather forecast anymore, I just check my OffShift dashboard.&quot;
                </p>
                <footer className="flex items-center gap-4">
                  <img alt="Rider" className="w-10 h-10 rounded-full object-cover" data-alt="portrait of a confident woman in professional attire, soft natural window light, warm earth tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtwrC18bFjNrq24T0nymaiX_8uqs1zL1gzbfWEjfX3TpBYHyaVcCdVNT1aIi86TeHDWdWqd_LIJoa4pqjeHw_o9X77L8Qunt3nFkm715eV3D55CVPujOBfkV2XHM7NgBJy4rHkA7FNCezg0CVq5E5W0HxvI1NZ9isIdfsLM2sTfjoqEBSYDioC4nAs0WJYvNoVkJM-KVM-E_D1pjWFk3XW0XM6PQetMRvIUflgPNc5-XlAYeFSytF8MZFl6RvX4aYY-G45Km_ZbmQ"/>
                  <div>
                    <cite className="font-label text-sm font-bold not-italic">Priya Sharma</cite>
                    <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">Ride-share Driver, Delhi</p>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>
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
          <div className="flex flex-col items-center justify-center bg-[#3A4D39] text-white dark:bg-[#3A4D39] dark:text-[#f9f9f7] rounded-full px-5 py-2 scale-95 duration-200 cursor-pointer">
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
          <div className="flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 p-2 hover:text-[#3A4D39] dark:hover:text-white transition-colors duration-200 cursor-pointer">
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
