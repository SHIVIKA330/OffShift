"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function BotSimulator() {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "नमस्ते! I am the OffShift Bot. Type 'hi' to get started." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userPhone, setUserPhone] = useState("+919876543210");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWorkerInfo = async () => {
       const supabase = createClient();
       const id = localStorage.getItem("offshift_worker_id");
       if (id) {
         const { data } = await supabase.from("workers").select("phone").eq("id", id).single();
         if (data?.phone) setUserPhone(data.phone);
       }
    };
    void fetchWorkerInfo();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      // We hit the local API on the same origin
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: { text: userText },
          sender: userPhone 
        }),
      });
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: "bot", text: data.simulated_whatsapp_reply || "I'm having trouble connecting." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Error connecting to Bot API. Make sure 'npm run dev' is running!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-body">
      {/* Header */}
      <header className="bg-[#075e54] text-white p-4 flex items-center gap-4 shadow-lg sticky top-0 z-10">
        <Link href="/">
           <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
           <span className="material-symbols-outlined text-white">smart_toy</span>
        </div>
        <div>
          <h1 className="font-headline text-lg leading-tight">OffShift Assistant</h1>
          <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online • Bot Simulator</p>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto max-w-lg mx-auto w-full pt-6"
        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay", backgroundColor: "#e5ddd5" }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start animate-fade-in"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
              m.role === "user" 
                ? "bg-[#dcf8c6] text-stone-800 rounded-tr-none" 
                : "bg-white text-stone-800 rounded-tl-none border border-stone-200"
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              <p className="text-[9px] text-stone-400 text-right mt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl shadow-sm flex gap-1">
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f0f0] p-3 sticky bottom-0 border-t border-stone-200">
        <form onSubmit={sendMessage} className="max-w-lg mx-auto flex gap-2">
          <input
            type="text"
            className="flex-1 bg-white p-3 rounded-full text-sm outline-none shadow-sm border border-stone-200 focus:border-[#075e54]"
            placeholder="Type 'hi', 'status', or 'renew'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            className="w-12 h-12 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
        <p className="text-center text-[10px] text-stone-400 mt-2">
           Simulated WhatsApp Interface for Hackathon Demo
        </p>
      </div>
    </div>
  );
}
