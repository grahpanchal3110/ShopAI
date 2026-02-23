// components/ai/smart-search-bar.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Mic, X, Loader2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SearchSuggestion {
  type: "product" | "category" | "query";
  id?: string;
  text: string;
  image?: string;
  price?: number;
  slug?: string;
}

export function SmartSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/ai/smart-search?q=${encodeURIComponent(q)}&suggestions=true`,
      );
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  const handleSearch = (q: string = query) => {
    if (!q.trim()) return;
    setIsOpen(false);
    router.push(`/products/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.start();
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search products, categories..."
          className="pl-9 pr-20 h-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6",
              isListening && "text-red-500 animate-pulse",
            )}
            onClick={handleVoiceSearch}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || query.length >= 2) && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Press Enter to search for `{query}`
            </div>
          )}

          {suggestions.map((s, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors"
              onMouseDown={() => {
                if (s.type === "product" && s.slug) {
                  router.push(`/products/${s.slug}`);
                } else {
                  handleSearch(s.text);
                }
              }}
            >
              {s.type === "product" && s.image ? (
                <Image
                  src={s.image}
                  alt={s.text}
                  width={40}
                  height={40}
                  className="rounded-md object-cover"
                />
              ) : s.type === "query" ? (
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.text}</p>
                {s.type === "product" && s.price && (
                  <p className="text-xs text-muted-foreground">
                    ₹{s.price.toLocaleString()}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
