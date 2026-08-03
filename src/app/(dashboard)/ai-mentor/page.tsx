'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from '@/components/layout/header';
import {
  Sparkles, Send, BookOpen, TrendingUp,
  Brain, Scale, RotateCcw, Copy, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';
import { useAiLimitStore } from '@/store/use-ai-limit-store';
import { TARGET_EXAM_LABELS } from '@/types/auth';
import { mentorService } from '@/services/mentor.service';
import { AiUsageIndicator } from '@/components/ai/AiUsageIndicator';

// ── Types ─────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedTopics?: string[];
  examRelevance?: string;
  error?: boolean;
}

// ── Suggestion chips ──────────────────────────────────────────────

const SUGGESTIONS = [
  {
    icon: BookOpen,
    subject: 'Polity',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
    question: 'Explain Article 356 and its misuse in Indian politics',
  },
  {
    icon: TrendingUp,
    subject: 'Economy',
    color: '#059669',
    bg: 'rgba(5,150,105,0.08)',
    question: 'Difference between fiscal deficit and revenue deficit',
  },
  {
    icon: Brain,
    subject: 'Current Affairs',
    color: '#0891B2',
    bg: 'rgba(8,145,178,0.08)',
    question: "Significance of India's membership in the QUAD alliance",
  },
  {
    icon: Scale,
    subject: 'Ethics',
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.08)',
    question: 'Explain Kantian ethics with UPSC-relevant examples',
  },
] as const;

// ── Markdown component styles ─────────────────────────────────────

const MD: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => (
    <h1 className="text-base font-bold text-foreground mt-5 mb-2 pb-1.5 border-b border-border first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-[15px] font-bold text-foreground mt-5 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-foreground mt-4 mb-1.5 first:mt-0 flex items-center gap-2">
      <span className="inline-block h-3.5 w-0.5 rounded-full bg-primary shrink-0" />
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-foreground leading-[1.75] mb-3 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-2.5 space-y-1.5 pl-1">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2.5 space-y-1.5 pl-4 list-decimal marker:text-primary/60 marker:text-xs marker:font-bold">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
      <span className="mt-1.75 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
      <span className="flex-1 min-w-0">{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-foreground/80">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary/40 pl-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="font-mono text-[12px] bg-primary/8 text-primary px-1.5 py-0.5 rounded-md">
      {children}
    </code>
  ),
  hr: () => <hr className="my-4 border-border" />,
};

// ── Typing indicator ──────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
      >
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {copied
        ? <><Check className="h-3 w-3 text-emerald-500" />Copied</>
        : <><Copy className="h-3 w-3" />Copy</>}
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed text-white"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
      >
        <Sparkles className="h-4 w-4 text-white" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Response card */}
        <div
          className={cn(
            'rounded-2xl rounded-tl-sm border bg-card px-5 py-4',
            msg.error
              ? 'border-destructive/30 bg-destructive/5 text-destructive text-sm'
              : 'border-border',
          )}
        >
          {msg.error ? (
            msg.content
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
              {msg.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Related topics */}
        {msg.relatedTopics && msg.relatedTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              Related:
            </span>
            {msg.relatedTopics.map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/15"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Exam relevance */}
        {msg.examRelevance && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-50/70 dark:bg-amber-950/20 px-3.5 py-2.5">
            <span className="text-amber-500 text-sm shrink-0 mt-0.5">📌</span>
            <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
              <span className="font-bold">Exam tip: </span>{msg.examRelevance}
            </p>
          </div>
        )}

        {/* Actions */}
        {!msg.error && (
          <div className="flex items-center gap-3 px-1">
            <CopyButton text={msg.content} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function AiMentorPage() {
  const { user } = useAuthStore();
  const remaining = useAiLimitStore((s) => s.remaining);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  const examLabel = user?.target_exam ? TARGET_EXAM_LABELS[user.target_exam] : 'UPSC CSE';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }

  const sendMessage = useCallback(async (question: string) => {
    const text = question.trim();
    if (!text || isLoading || remaining === 0) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await mentorService.ask(text, user?.target_exam ?? undefined, history);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.answer,
          relatedTopics: res.relatedTopics,
          examRelevance: res.examRelevance,
        },
      ]);
    } catch (err) {
      const code = (err as { response?: { data?: { code?: string } } }).response?.data?.code;
      if (code !== 'AI_DAILY_LIMIT_REACHED') {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Something went wrong. Please try again.',
            error: true,
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, user?.target_exam]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-screen">
      <Header
        title="Ask Remi"
        action={
          messages.length > 0 ? (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New chat
            </button>
          ) : undefined
        }
      />

      {/* Messages / Welcome */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-6">
            <div className="w-full max-w-2xl space-y-5">
              <div className="text-center space-y-2">
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-1"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', boxShadow: '0 6px 24px rgba(124,58,237,0.3)' }}
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Ask Remi</h1>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Your Remindology AI tutor — ask anything about {examLabel}, PYQs, strategy, or current affairs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.question}
                      onClick={() => sendMessage(s.question)}
                      disabled={isLoading}
                      className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/30 hover:bg-secondary/40 hover:shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
                        style={{ background: s.bg }}
                      >
                        <Icon className="h-4 w-4" style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: s.color }}>
                          {s.subject}
                        </p>
                        <p className="text-[13px] text-foreground leading-snug group-hover:text-primary transition-colors">
                          {s.question}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your exam… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none leading-relaxed"
              style={{ maxHeight: 140, minHeight: 44 }}
              disabled={isLoading}
            />
            <div className="flex items-center gap-2 px-3 pb-3 pt-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">
                <Brain className="h-3 w-3" />
                {examLabel}
              </span>
              <AiUsageIndicator />
              <div className="flex-1" />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || remaining === 0}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: input.trim() ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                }}
              >
                {isLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Thinking…
                  </>
                ) : (
                  <>Ask <Send className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/50 mt-2">
            Remi may make mistakes — verify important facts before the exam.
          </p>
        </div>
      </div>
    </div>
  );
}
