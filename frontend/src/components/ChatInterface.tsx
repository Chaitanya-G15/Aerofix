"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "ai";
  content: string | any;
  images?: { url: string; page: number }[];
}

export default function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "System online. Ask me about AC manuals, error codes, or diagnostics." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const deviceIdMatch = pathname.match(/\/devices\/([^/]+)/);
        const deviceId = deviceIdMatch ? decodeURIComponent(deviceIdMatch[1]) : "";
        const url = `http://localhost:8000/api/chat/history?user_id=demo_tech${deviceId ? `&device_id=${deviceId}` : ""}`;
        
        const res = await fetch(url);
        const data = await res.data || await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const historyMessages = data.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }));
          setMessages(historyMessages);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    
    fetchHistory();
  }, [pathname]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const deviceIdMatch = pathname.match(/\/devices\/([^/]+)/);
      const deviceId = deviceIdMatch ? decodeURIComponent(deviceIdMatch[1]) : null;

      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, device_id: deviceId }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: data.diagnosis || data.answer,
        images: data.images
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Error: Could not connect to AeroFix AI backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Hide on login page - MOVED AFTER HOOKS
  if (pathname === "/login") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-sm font-semibold tracking-tight">AeroFix AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => {
              const isDiagnostic = typeof m.content === "object" && m.content !== null && "prep_list" in m.content;
              
              return (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === "user" 
                      ? "bg-cyan-600 text-white" 
                      : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                  }`}>
                    {m.role === "user" ? (
                      m.content
                    ) : isDiagnostic ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                          <span className="font-bold text-cyan-400">AI Diagnostic Report</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            m.content.severity_score > 70 ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                          }`}>
                            Severity: {m.content.severity_score}/100
                          </span>
                        </div>
                        
                        <p className="text-xs leading-relaxed">{m.content.analysis}</p>
                        
                        <div className="rounded-lg bg-black/30 p-2 border border-white/5">
                          <p className="text-[10px] font-bold uppercase text-zinc-500">Root Cause</p>
                          <p className="text-xs text-cyan-300">{m.content.root_cause}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase text-zinc-500">Required Tools</p>
                            <ul className="list-inside list-disc text-[10px] text-zinc-400">
                              {m.content.prep_list.tools.map((t: string) => <li key={t}>{t}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase text-zinc-500">Needed Parts</p>
                            <ul className="list-inside list-disc text-[10px] text-zinc-400">
                              {m.content.prep_list.parts.map((p: string) => <li key={p}>{p}</li>)}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-lg bg-cyan-500/10 p-2 border border-cyan-500/20">
                          <p className="text-[10px] font-bold uppercase text-cyan-500">Recommended Action</p>
                          <p className="text-xs text-zinc-200">{m.content.recommended_action}</p>
                        </div>

                        {m.images && m.images.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-[10px] font-bold uppercase text-zinc-500">Related Diagrams (Manual)</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {m.images.map((img, idx) => (
                                <img 
                                  key={idx} 
                                  src={img.url} 
                                  alt={`Manual Diagram Page ${img.page}`}
                                  className="h-24 w-32 rounded-lg object-cover border border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                                  onClick={() => window.open(img.url, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-zinc-400 italic">
                  Analyzing logs and manuals...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-800 bg-black/20">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs focus:border-cyan-500/50 focus:outline-none"
                placeholder="Ask about fault codes or repair steps..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold hover:bg-cyan-500 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/30 transition-transform hover:scale-110 active:scale-95"
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
