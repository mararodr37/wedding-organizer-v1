"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dailyContext, setDailyContext] = useState<string | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch today's context on mount
  useEffect(() => {
    fetch("/api/chat/context")
      .then((r) => r.json())
      .then((data) => {
        if (data.context) {
          setDailyContext(data.context);
        }
      })
      .catch(console.error)
      .finally(() => setContextLoading(false));
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          context: dailyContext,
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages([...updatedMessages, { role: "assistant", content: data.response }]);
      } else {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: "Sorry, I couldn't generate a response. Please try again." },
        ]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
          &larr;
        </Link>
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Coach M</h1>
          <p className="text-xs text-gray-500">
            {contextLoading ? "Loading context..." : "Fitness + Beauty Coach"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !contextLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-1">Chat with Coach M</p>
            <p className="text-gray-300 text-xs">
              Ask about your workout, skincare routine, nutrition, or wedding prep.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gray-900 text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm px-4 py-2.5 text-sm">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Coach M..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
