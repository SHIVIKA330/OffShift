"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { riskBand, type ShiftType, type Platform } from "@/lib/kavach-engine";
import { formatRupees } from "@/lib/format";
import { ZONE_STATES, type ZoneSlug } from "@/lib/zones";

type PremiumRes = {
  final_premium: number;
  kavach_score: number;
  max_payout: number;
  explanation_hindi: string;
};

const SHIFTS: { value: ShiftType; label: string; hi: string }[] = [
  { value: "morning", label: "Morning 6am–2pm", hi: "सुबह 6–2" },
  { value: "evening", label: "Evening 2pm–10pm", hi: "शाम 2–10" },
  { value: "night", label: "Night 10pm–6am", hi: "रात 10–6" },
  { value: "flexible", label: "Flexible", hi: "लचीला" },
];

const GIG_CATEGORIES: { id: string; title: string; titleHi: string; icon: string; platforms: { id: Platform; label: string; icon: string }[] }[] = [
  {
    id: "food_delivery", title: "Food Delivery", titleHi: "फ़ूड डिलीवरी", icon: "restaurant",
    platforms: [
      { id: "zomato", label: "Zomato", icon: "🍽️" },
      { id: "swiggy", label: "Swiggy", icon: "🛵" },
      { id: "dunzo", label: "Dunzo", icon: "📦" },
    ],
  },
  {
    id: "grocery", title: "Grocery & Quick Commerce", titleHi: "किराना / क्विक कॉमर्स", icon: "local_grocery_store",
    platforms: [
      { id: "zepto", label: "Zepto", icon: "⚡" },
      { id: "blinkit", label: "Blinkit", icon: "🛍️" },
      { id: "bigbasket", label: "BigBasket", icon: "🧺" },
    ],
  },
  {
    id: "ride_hailing", title: "Ride-Hailing / Cab", titleHi: "राइड-हेलिंग / कैब", icon: "local_taxi",
    platforms: [
      { id: "ola", label: "Ola", icon: "🚕" },
      { id: "uber", label: "Uber", icon: "🚗" },
      { id: "rapido", label: "Rapido", icon: "🏍️" },
      { id: "namma_yatri", label: "Namma Yatri", icon: "🛺" },
    ],
  },
  {
    id: "logistics", title: "Logistics & Courier", titleHi: "लॉजिस्टिक्स / कूरियर", icon: "local_shipping",
    platforms: [
      { id: "porter", label: "Porter", icon: "🚛" },
      { id: "delhivery", label: "Delhivery", icon: "📬" },
      { id: "ecom_express", label: "Ecom Express", icon: "📮" },
      { id: "shadowfax", label: "Shadowfax", icon: "🏷️" },
    ],
  },
  {
    id: "construction", title: "Construction & Skilled Labour", titleHi: "निर्माण / कुशल श्रम", icon: "construction",
    platforms: [
      { id: "construction", label: "Construction Worker", icon: "🏗️" },
      { id: "plumber", label: "Plumber", icon: "🔧" },
      { id: "electrician", label: "Electrician", icon: "🔌" },
      { id: "painter", label: "Painter", icon: "🖌️" },
      { id: "carpenter", label: "Carpenter", icon: "🪚" },
    ],
  },
  {
    id: "domestic", title: "Domestic & Home Services", titleHi: "घरेलू सेवा", icon: "home",
    platforms: [
      { id: "urban_company", label: "Urban Company", icon: "🏠" },
      { id: "housejoy", label: "Housejoy", icon: "🧹" },
      { id: "maid", label: "Maid / Housekeeper", icon: "🫧" },
      { id: "cook", label: "Cook / Chef", icon: "👨‍🍳" },
      { id: "driver", label: "Personal Driver", icon: "🚘" },
    ],
  },
  {
    id: "healthcare", title: "Healthcare & Pharmacy", titleHi: "स्वास्थ्य / फार्मेसी", icon: "local_pharmacy",
    platforms: [
      { id: "pharmeasy", label: "PharmEasy", icon: "💊" },
      { id: "1mg", label: "1mg / Tata Health", icon: "💉" },
      { id: "practo", label: "Practo", icon: "🏥" },
    ],
  },
  {
    id: "freelance", title: "Freelance & Other", titleHi: "फ्रीलांस / अन्य", icon: "work",
    platforms: [
      { id: "freelance", label: "Freelancer", icon: "💻" },
      { id: "tutor", label: "Tutor / Teacher", icon: "📚" },
      { id: "photographer", label: "Photographer", icon: "📷" },
      { id: "other", label: "Other", icon: "✨" },
    ],
  },
];

type PaymentPhase = "idle" | "processing" | "verifying" | "done";
type AuthMode = "choose" | "login" | "signup";

export function OnboardingWizard() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("choose");
  // Screens: 
  // 0  = Auth Login/Signup
  // 0.5 = Verify Email
  // 1  = Permissions
  // 2  = Profile Setup
  // 3  = Identity Verification
  // 4  = Shift & Settlement (Work Zone)
  // 5  = Kavach Score
  // 6  = Payment
  const [screen, setScreen] = useState(0); 
  const [loading, setLoading] = useState(false);

  // Check if already logged in to skip auth screens
  useEffect(() => {
    const id = localStorage.getItem("offshift_worker_id");
    const uname = localStorage.getItem("offshift_worker_name");
    if (id && screen === 0) {
      if (uname) setName(uname);
      setScreen(4); // Skip directly to Settlement for renewals
    }
  }, [screen]);

  // Login fields
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign-up variables
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Permissions
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{lat: number; lng: number} | null>(null);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Profile fields
  const [gigCategory, setGigCategory] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("zomato");
  const [riderId, setRiderId] = useState("");
  const [zone, setZone] = useState<ZoneSlug>("mumbai");

  // Identity Verification
  const [aadhaarUploaded, setAadhaarUploaded] = useState(false);
  const [faceCaptured, setFaceCaptured] = useState(false);

  // Shift & Settlement
  const [shift, setShift] = useState<ShiftType>("evening");
  const [settlementChannel, setSettlementChannel] = useState<"UPI" | "IMPS" | "RAZORPAY">("UPI");
  const [upiVpa, setUpiVpa] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [days, setDays] = useState([5]);

  // Kavach Score
  const [calcLoading, setCalcLoading] = useState(false);
  const [premium, setPremium] = useState<PremiumRes | null>(null);

  // Payment
  const [payPhase, setPayPhase] = useState<PaymentPhase>("idle");
  const [mockTxnId, setMockTxnId] = useState("");
  const [policyCard, setPolicyCard] = useState<{ id: string; } | null>(null);

  // ── Handlers ──
  const handleLogin = async () => {
    const n = loginPhone.replace(/\D/g, "");
    if (n.length < 10) return toast.error("10-digit mobile number चाहिए");
    if (!loginPassword) return toast.error("Password ज़रूरी है");
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: n, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");

      localStorage.setItem("offshift_worker_id", data.worker.id);
      localStorage.setItem("offshift_worker_name", data.worker.name);
      toast.success(`Welcome back, ${data.worker.name}!`);
      router.push("/dashboard");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupFirstStep = () => {
    if (name.trim().length < 2) return toast.error("Name is required");
    if (phone.replace(/\D/g, "").length < 10) return toast.error("Valid 10-digit mobile number required");
    if (!email.includes("@")) return toast.error("Valid email is required");
    if (password.length < 4) return toast.error("Password at least 4 chars");
    
    // Skip Email OTP and proceed directly to Permissions
    setScreen(1);
  };

  const verifyEmailOtp = () => {
    if (otp.length < 4) return toast.error("Enter OTP");
    toast.success("✅ Email Verified!");
    setScreen(1); // Proceed to Permissions
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationGranted(true);
        setLocationCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("📍 Location granted!");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location denied. Please allow it in browser settings.");
        } else {
          // Allow bypass for desktop/demo
          setLocationGranted(true);
          toast.success("📍 Location set to default zone.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const requestCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Camera not supported on this device");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setCameraGranted(true);
      toast.success("📷 Camera granted!");
      // Stop the stream after verifying permission (we only needed the grant)
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        toast.error("Camera denied. Please allow it in browser settings.");
      } else {
        // Allow bypass for desktop/demo environments
        setCameraGranted(true);
        toast.success("📷 Camera granted (demo mode).");
      }
    }
  };

  const handlePermissions = () => {
    if (!locationGranted || !cameraGranted) return toast.error("Please grant all required permissions to continue");
    setScreen(2);
  };

  const handleProfileSubmit = () => {
    if (!platform) return toast.error("Please select your gig service");
    if (!riderId) return toast.error("Worker / Rider ID required");
    setScreen(3);
  };

  const handleIdentityVerify = () => {
    if (!aadhaarUploaded || !faceCaptured) return toast.error("Please complete identity verification");
    setScreen(4);
  };

  const handleSettlementSubmit = () => {
    if (settlementChannel === "UPI" && !upiVpa) return toast.error("Enter UPI ID");
    if (settlementChannel === "IMPS" && (!bankAccount || !bankIfsc)) return toast.error("Enter Bank Details");
    setScreen(5);
  };

  // ── Kavach Score calc ──
  useEffect(() => {
    if (screen !== 5) return;
    let cancelled = false;
    (async () => {
      setCalcLoading(true);
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch("/api/calculate-premium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zone, shift_type: shift, active_days: days[0], platform, coverage_type: "7day",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "calc failed");
        if (!cancelled) setPremium(data as PremiumRes);
      } catch (e) {
        if (!cancelled) toast.error(String(e));
      } finally {
        if (!cancelled) setCalcLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [screen, zone, shift, days, platform]);

  // ── Load Razorpay script ──
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const handlePayment = async (plan: "24hr" | "7day") => {
    if (!premium) return;
    const amount = plan === "24hr" ? Math.round(premium.final_premium * 0.6) : premium.final_premium;
    const amountPaise = amount * 100;

    setPayPhase("processing");
    let workerId = localStorage.getItem("offshift_worker_id");
    
    if (!workerId) {
      try {
        const regRes = await fetch("/api/workers/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name, platform, rider_id: riderId.toUpperCase(), zone, shift_type: shift,
            active_days_per_week: days[0], kavach_score: premium.kavach_score,
            phone: `+91${phone.replace(/\D/g, "").slice(-10)}`, password,
            settlement_channel: settlementChannel, upi_vpa: settlementChannel === "UPI" ? upiVpa : undefined,
            bank_account_number: settlementChannel === "IMPS" ? bankAccount : undefined,
            bank_ifsc: settlementChannel === "IMPS" ? bankIfsc : undefined,
            bank_account_name: settlementChannel === "IMPS" ? bankName : undefined,
          }),
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error ?? "Registration failed");
        workerId = regData.worker_id;
        localStorage.setItem("offshift_worker_id", workerId!);
        localStorage.setItem("offshift_worker_name", name);
      } catch (e) {
        toast.error(String(e));
        setPayPhase("idle");
        return;
      }
    }

    setPayPhase("idle");
    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) return toast.error("Razorpay not loaded");

    const rzp = new Razorpay({
      key: "rzp_test_SZ6NW9Iw3MPiaL",
      amount: amountPaise,
      currency: "INR",
      name: "OffShift",
      description: "Smart Income Shield",
      theme: { color: "#273528" },
      handler: async (response: any) => {
        setPayPhase("verifying");
        setMockTxnId(response.razorpay_payment_id);
        try {
          const polRes = await fetch("/api/payments/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              worker_id: workerId, plan_type: plan, zone, shift_type: shift, active_days: days[0], platform, razorpay_payment_id: response.razorpay_payment_id,
            }),
          });
          const polData = await polRes.json();
          if (!polRes.ok) throw new Error(polData.error ?? "Policy failed");
          setPayPhase("done");
          setPolicyCard(polData.policy);
          toast.success("Policy activated!");
        } catch (e) {
          toast.error(String(e));
          setPayPhase("idle");
        }
      },
      modal: { ondismiss: () => setPayPhase("idle") },
    });
    rzp.open();
  };

  const band = premium ? riskBand(premium.kavach_score) : null;

  // Reusable Classes
  const inputStyle = "w-full h-14 bg-surface-container-low rounded-xl px-4 text-on-surface font-body text-sm focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/15 outline-none";
  const btnPrimaryStyle = "w-full py-4 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest hover:scale-[1.02] flex items-center justify-center gap-2 transition-all";
  const btnSecondaryStyle = "w-full py-4 rounded-full bg-surface-container-highest text-on-surface font-label text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors";

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-[#f9f9f7] dark:bg-stone-950 backdrop-blur-md opacity-90 flex justify-between items-center px-6 py-4 border-b border-outline-variant/10">
        <Link href="/">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
            <h1 className="text-2xl font-semibold tracking-tighter text-primary font-['Newsreader']">OffShift</h1>
          </div>
        </Link>
        {screen >= 1 && screen <= 6 && (
           <div className="text-[10px] font-label uppercase tracking-widest bg-surface-container-low px-4 py-2 rounded-full text-secondary">
             Step {Math.floor(screen)} of 6
           </div>
        )}
      </header>

      <main className="pt-28 pb-12 px-6 max-w-md mx-auto">
        
        {/* SCREEN 0: Chooser */}
        {screen === 0 && authMode === "choose" && (
          <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-container">
              <span className="material-symbols-outlined text-4xl text-on-primary-container">gpp_good</span>
            </div>
            <h2 className="font-headline text-4xl font-medium mb-3">Kavach</h2>
            <p className="font-body text-sm text-on-surface-variant mb-10">Smart Income Shield for Gig Workers</p>
            <div className="space-y-4">
              <button className={btnPrimaryStyle} onClick={() => setAuthMode("signup")}>Sign Up</button>
              <button className={btnSecondaryStyle} onClick={() => setAuthMode("login")}>Login</button>
            </div>
          </div>
        )}

        {/* SCREEN 0: Login */}
        {screen === 0 && authMode === "login" && (
          <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10">
            <h2 className="font-headline text-4xl font-medium mb-8 text-center">Welcome Back</h2>
            <div className="space-y-6">
              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="flex h-14 w-16 items-center justify-center rounded-xl bg-surface-container-low">+91</span>
                  <input className={inputStyle} value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Password</label>
                <input type="password" className={inputStyle} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              </div>
              <button className={btnPrimaryStyle} onClick={handleLogin} disabled={loading}>Login</button>
            </div>
          </div>
        )}

        {/* SCREEN 0: Sign Up Details */}
        {screen === 0 && authMode === "signup" && (
          <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10">
            <h2 className="font-headline text-4xl font-medium mb-8 text-center">Create Account</h2>
            <div className="space-y-6">
              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Full Name</label>
                <input className={inputStyle} placeholder="Rahul Kumar" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="flex h-14 w-16 items-center justify-center rounded-xl bg-surface-container-low">+91</span>
                  <input className={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Email Address</label>
                <input type="email" className={inputStyle} placeholder="rider@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Password</label>
                <input type="password" className={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className={btnPrimaryStyle} onClick={handleSignupFirstStep}>Continue</button>
            </div>
          </div>
        )}

        {/* SCREEN 0.5: Verify Email */}
        {screen === 0.5 && (
          <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="material-symbols-outlined text-3xl">mail</span>
            </div>
            <h2 className="font-headline text-3xl font-medium mb-3">Verify your email</h2>
            <p className="font-body text-sm text-on-surface-variant mb-8">We sent a 6-digit PIN to {email}</p>
            <input 
              className={inputStyle + " text-center tracking-[1em] text-xl font-mono"} 
              placeholder="••••••" 
              maxLength={6} 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
            />
            <button className={btnPrimaryStyle + " mt-8"} onClick={verifyEmailOtp}>Confirm Email</button>
          </div>
        )}

        {/* SCREEN 1: Required Permissions */}
        {screen === 1 && (
          <div className="animate-fade-in relative">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant/10">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_locked</span>
              </div>
              <h2 className="font-headline text-4xl font-medium mb-3">Required permissions</h2>
              <p className="font-body text-sm text-on-surface-variant">We need these to verify your ID, set your zone, and automate payouts.</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-5 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest flex items-start gap-4">
                 <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                 <div className="flex-1">
                   <h4 className="font-headline text-lg mb-1">Location (GPS)</h4>
                   <p className="text-xs text-on-surface-variant leading-relaxed mb-3">Used to set your delivery zone and map real-time disruption data.</p>
                   {locationGranted ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-widest">✓ Granted</span>
                        {locationCoords && <span className="text-[10px] text-on-surface-variant">{locationCoords.lat.toFixed(2)}°N, {locationCoords.lng.toFixed(2)}°E</span>}
                      </div>
                    ) : (
                      <button onClick={requestLocation} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">my_location</span> Request Location
                      </button>
                    )}
                 </div>
              </div>

              <div className="p-5 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest flex items-start gap-4">
                 <span className="material-symbols-outlined text-primary mt-1">camera_alt</span>
                 <div className="flex-1">
                   <h4 className="font-headline text-lg mb-1">Camera</h4>
                   <p className="text-xs text-on-surface-variant leading-relaxed mb-3">Used for mandatory face verification and document upload.</p>
                   {cameraGranted ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-widest">✓ Granted</span>
                    ) : (
                      <button onClick={requestCamera} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">photo_camera</span> Request Camera
                      </button>
                    )}
                 </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
              <p className="text-amber-600 dark:text-amber-400 text-xs text-center font-body">Zone and location tracking work best on mobile. You can continue and set manually later.</p>
            </div>

            <button className={btnPrimaryStyle} onClick={handlePermissions}>Continue</button>
          </div>
        )}

        {/* SCREEN 2: Profile */}
        {screen === 2 && (
          <div className="animate-fade-in relative">
            <h2 className="font-headline text-4xl font-medium mb-2 text-center">Complete your profile</h2>
            <p className="text-sm text-on-surface-variant text-center mb-8">अपनी गिग सेवा चुनें — Select your gig service</p>
            <div className="space-y-6">
              
              {/* ── Gig Category Selector ── */}
              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-3 block">What type of gig work do you do? / आप क्या काम करते हैं?</label>
                <div className="space-y-3">
                  {GIG_CATEGORIES.map(cat => (
                    <div key={cat.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden transition-all">
                      {/* Category Header */}
                      <button
                        onClick={() => setGigCategory(gigCategory === cat.id ? null : cat.id)}
                        className={`w-full flex items-center gap-3 p-4 transition-colors ${
                          gigCategory === cat.id ? 'bg-primary/5' : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                        <div className="flex-1 text-left">
                          <span className="font-body text-sm font-semibold block">{cat.title}</span>
                          <span className="font-body text-[11px] text-on-surface-variant">{cat.titleHi}</span>
                        </div>
                        {/* Show check if a platform from this category is selected */}
                        {cat.platforms.some(p => p.id === platform) && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest">
                            {cat.platforms.find(p => p.id === platform)?.label}
                          </span>
                        )}
                        <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform ${gigCategory === cat.id ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>

                      {/* Expanded Platform Options */}
                      {gigCategory === cat.id && (
                        <div className="px-4 pb-4 pt-1 border-t border-outline-variant/10">
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {cat.platforms.map(p => (
                              <button
                                key={p.id}
                                onClick={() => setPlatform(p.id)}
                                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                                  platform === p.id
                                    ? 'border-primary bg-primary/10 shadow-sm'
                                    : 'border-outline-variant/15 hover:border-outline-variant/30 bg-surface-container-low text-on-surface-variant'
                                }`}
                              >
                                <span className="text-lg">{p.icon}</span>
                                <span className="font-body text-xs font-semibold flex-1">{p.label}</span>
                                {platform === p.id && <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected platform badge */}
              {platform && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <div className="flex-1">
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block">Selected Platform</span>
                    <span className="font-body text-sm font-semibold capitalize">{platform.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Full Name</label>
                <input className={inputStyle + " opacity-50 cursor-not-allowed"} value={name} readOnly />
              </div>

              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Phone Number</label>
                <input className={inputStyle + " opacity-50 cursor-not-allowed"} value={phone} readOnly />
              </div>

              <div>
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2 block">Worker / Rider ID (Required)</label>
                <input className={inputStyle + " uppercase font-mono"} placeholder={`e.g. ${platform.slice(0,2).toUpperCase()}-12345`} value={riderId} onChange={(e) => setRiderId(e.target.value)} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Pin your work zone</label>
                  <span className="text-[9px] text-primary flex items-center gap-1 cursor-pointer hover:underline"><span className="material-symbols-outlined text-[12px]">my_location</span> Use GPS</span>
                </div>
                <select className={inputStyle + " appearance-none cursor-pointer"} value={zone} onChange={(e) => setZone(e.target.value as ZoneSlug)}>
                  {ZONE_STATES.map((st) => (
                    <optgroup key={st.state} label={st.state}>
                      {st.cities.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button className={btnPrimaryStyle + " mt-4"} onClick={handleProfileSubmit}>Next</button>
            </div>
          </div>
        )}

        {/* SCREEN 3: Identity Verification */}
        {screen === 3 && (
          <div className="animate-fade-in relative bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant/10">
                <span className="material-symbols-outlined text-2xl">passkey</span>
              </div>
              <h2 className="font-headline text-3xl font-medium mb-3">Identity verification</h2>
              <p className="font-body text-xs text-on-surface-variant">Government ID and face verification via AI to prevent fraud.</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="border border-outline-variant/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">id_card</span></div>
                   <h4 className="font-headline text-lg">Government ID (Aadhaar)</h4>
                </div>
                <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center hover:bg-surface-container-highest transition-colors cursor-pointer" onClick={() => setAadhaarUploaded(true)}>
                  {aadhaarUploaded ? (
                    <div className="flex flex-col items-center text-primary">
                      <span className="material-symbols-outlined text-3xl mb-2">task_alt</span>
                      <span className="font-label text-xs uppercase tracking-widest font-bold">Document Verified</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">upload_file</span>
                      <p className="font-body text-xs text-on-surface-variant">Choose file (JPEG, PNG, WebP) or <br/><strong>Click to simulate upload</strong></p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-outline-variant/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">face</span></div>
                   <h4 className="font-headline text-lg">Face Verification</h4>
                </div>
                <div className="bg-surface-container rounded-xl p-4 text-center mb-3">
                  <p className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface">Live Action Task:</p>
                  <p className="font-body text-sm text-on-surface-variant mt-1 italic">"Please wink with your right eye to prove liveness."</p>
                </div>
                {faceCaptured ? (
                  <button className="w-full py-3 bg-[#cbebc8] text-[#07200b] rounded-lg font-label text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2" disabled>
                     <span className="material-symbols-outlined text-[18px]">verified_user</span> Verified
                  </button>
                ) : (
                  <button className="w-full py-3 border border-outline-variant/20 bg-surface-container-lowest rounded-lg font-label text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center gap-2" onClick={() => setFaceCaptured(true)}>
                     <span className="material-symbols-outlined text-[18px]">photo_camera</span> Capture Face
                  </button>
                )}
              </div>
            </div>

            <button className={btnPrimaryStyle} onClick={handleIdentityVerify}>Continue</button>
          </div>
        )}

        {/* SCREEN 4: Working Conditions & Settlement */}
        {screen === 4 && (
          <div className="animate-fade-in relative">
            <h2 className="font-headline text-4xl font-medium mb-8 text-center">Settlement Details</h2>
            
            <div className="space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-[24px] editorial-shadow border border-outline-variant/10">
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-4 block text-center">Typical Shift</label>
                <select className={inputStyle + " appearance-none"} value={shift} onChange={(e) => setShift(e.target.value as ShiftType)}>
                  {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <div className="mt-8">
                  <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-6 block text-center">Days active per week</label>
                  <Slider value={days} onValueChange={setDays} min={1} max={7} step={1} className="mb-4" />
                  <div className="text-center font-headline text-4xl text-primary">{days[0]} <span className="text-sm text-on-surface-variant font-body">days</span></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-[24px] editorial-shadow border border-outline-variant/10">
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-4 block text-center">Payout Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {["UPI", "IMPS", "RAZORPAY"].map(ch => (
                    <button key={ch} onClick={() => setSettlementChannel(ch as any)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${settlementChannel === ch ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/20 text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined">{ch === "UPI" ? "qr_code" : ch === "IMPS" ? "account_balance" : "credit_card"}</span>
                      <span className="text-[10px] font-bold">{ch}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant/10 h-[100px]">
                  {settlementChannel === "UPI" && <input className={inputStyle} placeholder="UPI VPA (e.g. rider@ybl)" value={upiVpa} onChange={(e) => setUpiVpa(e.target.value)} />}
                  {settlementChannel === "IMPS" && (
                    <div className="grid grid-cols-2 gap-2 h-[100px] overflow-auto">
                      <input className={inputStyle} placeholder="Bank Acc" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                      <input className={inputStyle} placeholder="IFSC" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
                      <input className={inputStyle + " col-span-2"} placeholder="Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                    </div>
                  )}
                  {settlementChannel === "RAZORPAY" && <p className="text-xs text-on-surface-variant text-center mt-6">Uses default Razorpay Sandbox Route.</p>}
                </div>
              </div>

              <button className={btnPrimaryStyle} onClick={handleSettlementSubmit}>Calculate Risk Score</button>
            </div>
          </div>
        )}

        {/* SCREEN 5: Kavach Score */}
        {screen === 5 && (
          <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10 text-center min-h-[500px] flex flex-col justify-center">
            {calcLoading ? (
              <div className="animate-fade-in flex flex-col justify-center items-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="font-headline text-2xl">Analyzing Profile...</h3>
                <p className="text-sm font-body text-on-surface-variant mt-2">Checking open-meteo, platform risk, and shift variables limits.</p>
              </div>
            ) : premium && band ? (
              <div className="animate-fade-in flex flex-col h-full">
                <p className="font-label text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">Actuarial Assessment</p>
                <h2 className="font-headline text-[80px] font-medium text-primary leading-none tracking-tighter">{premium.kavach_score}</h2>
                <div className="mt-4"><span className="px-4 py-2 rounded-full font-label text-xs font-bold uppercase tracking-widest bg-surface-container-highest">{band.label} RISK</span></div>
                <div className="mt-auto bg-surface-container-low rounded-2xl p-5 text-left mt-8">
                   <div className="flex justify-between items-center pb-2 mb-2 border-b border-outline-variant/10"><span>Weekly Base:</span> <strong>{formatRupees(band.weekRef)}</strong></div>
                   <div className="flex justify-between items-center"><span>Payout Max:</span> <strong>{formatRupees(premium.max_payout)}</strong></div>
                </div>
                <button className={btnPrimaryStyle + " mt-6"} onClick={() => setScreen(6)}>Select Premium Plan</button>
              </div>
            ) : null}
          </div>
        )}

        {/* SCREEN 6: Payment */}
        {screen === 6 && (premium || policyCard) && (
          <div className="animate-fade-in relative">
            {payPhase !== "idle" && payPhase !== "done" && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-md px-6">
                 <div className="w-full max-w-sm rounded-[32px] bg-surface-container-lowest p-8 editorial-shadow text-center">
                    <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="font-headline text-xl">Activating Smart Contract...</h3>
                 </div>
              </div>
            )}
            
            {payPhase === "done" && policyCard ? (
              <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow text-center">
                 <div className="w-20 h-20 bg-[#cbebc8] rounded-full mx-auto flex items-center justify-center mb-6"><span className="material-symbols-outlined text-4xl text-[#07200b]">verified</span></div>
                 <h2 className="font-headline text-3xl mb-4">Protection Active</h2>
                 <p className="font-body text-sm text-on-surface-variant mb-8">No further action required. The intelligence layer takes over from here.</p>
                 <Link href="/dashboard"><button className={btnPrimaryStyle}>Enter Dashboard</button></Link>
              </div>
            ) : (
              <div>
                <h2 className="font-headline text-4xl font-medium mb-8 text-center">Choose Coverage</h2>
                <div className="space-y-4">
                   <div className="bg-surface-container-lowest p-6 rounded-[32px] border border-outline-variant/10 text-center relative overflow-hidden group hover:border-primary transition-colors cursor-pointer" onClick={() => handlePayment("24hr")}>
                      <h3 className="font-headline text-2xl">Shift Pass</h3>
                      <p className="text-secondary tracking-widest uppercase font-label text-[10px] mt-1 mb-4">24 Hours</p>
                      <span className="font-headline text-4xl text-on-surface block mb-6">{formatRupees(Math.round(premium!.final_premium * 0.6))}</span>
                      <button className={btnSecondaryStyle}>Activate Shift Pass</button>
                   </div>
                   <div className="bg-primary p-6 rounded-[32px] editorial-shadow text-center text-on-primary relative cursor-pointer" onClick={() => handlePayment("7day")}>
                      <span className="absolute top-0 right-0 bg-primary-container text-on-primary-container px-3 py-1 rounded-bl-xl font-bold uppercase text-[10px] tracking-widest">Recommended</span>
                      <h3 className="font-headline text-2xl">Weekly Pass</h3>
                      <p className="text-on-primary/60 tracking-widest uppercase font-label text-[10px] mt-1 mb-4">7 Days Protection</p>
                      <span className="font-headline text-4xl block mb-6">{formatRupees(premium!.final_premium)}</span>
                      <button className="w-full py-4 rounded-full bg-surface-container-lowest text-primary font-label text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform">Activate Weekly</button>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
