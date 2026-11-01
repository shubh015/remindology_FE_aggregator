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
    question: 'Explain Article 356 and its misuse in Indian politics',
  },
  {
    icon: TrendingUp,
    subject: 'Economy',
    question: 'Difference between fiscal deficit and revenue deficit',
  },
  {
    icon: Brain,
    subject: 'Current Affairs',
    question: "Significance of India's membership in the QUAD alliance",
  },
  {
    icon: Scale,
    subject: 'Ethics',
    question: 'Explain Kantian ethics with UPSC-relevant examples',
  },
] as const;

// ── Markdown component styles ─────────────────────────────────────

// Base styling comes from `.doc-prose` on the wrapper; only heading sizes are
// tightened here so answers stay chat-dense.
const MD: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: ({ children }) => (
    <h1 className="text-base font-semibold text-ink pb-1.5 border-b border-rule">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="!text-[15px] !mt-5 !mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="!text-sm !mt-4 !mb-1.5">
      {children}
    </h3>
  ),
  hr: () => <hr className="!my-4" />,
};

// ── Typing indicator ──────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink">
        <Sparkles className="h-4 w-4 text-paper" />
      </div>
      <div className="flex items-center gap-1.5 rounded-[3px] border border-rule bg-paper-raised px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-muted animate-pulse"
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
      className="flex items-center gap-1.5 font-label text-[11px] text-ink-muted hover:text-ink transition-colors duration-150 ease-ks cursor-pointer"
    >
      {copied
        ? <><Check className="h-3 w-3 text-ink" />Copied</>
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
        <div className="max-w-[80%] rounded-[3px] px-4 py-3 text-sm leading-relaxed bg-ink text-paper">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink mt-0.5">
        <Sparkles className="h-4 w-4 text-paper" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {/* Response card */}
        <div
          className={cn(
            'rounded-[3px] border bg-paper-raised px-5 py-4',
            msg.error
              ? 'border-rule text-sm text-[oklch(52%_.16_35)]'
              : 'border-rule',
          )}
        >
          {msg.error ? (
            msg.content
          ) : (
            <div className="doc-prose !text-sm [&>*:first-child]:!mt-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Related topics */}
        {msg.relatedTopics && msg.relatedTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 px-1">
            <span className="font-label text-[10px] text-ink-muted uppercase tracking-[0.14em]">
              Related:
            </span>
            {msg.relatedTopics.map((t) => (
              <span
                key={t}
                className="ks-tag ks-tag-outline"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Exam relevance */}
        {msg.examRelevance && (
          <div className="flex items-start gap-2 rounded-[2px] border border-rule border-l-2 border-l-gold bg-paper-raised px-3.5 py-2.5">
            <span className="text-sm shrink-0 mt-0.5">📌</span>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              <span className="font-semibold text-ink">Exam tip: </span>{msg.examRelevance}
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
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors duration-150 ease-ks cursor-pointer"
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
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink mb-1">
                  <Sparkles className="h-6 w-6 text-paper" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">Ask Remi</h1>
                <p className="text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
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
                      className="ks-card group !flex items-start gap-3 p-4 text-left cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep mt-0.5">
                        <Icon className="h-4 w-4 text-ink" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted mb-1">
                          {s.subject}
                        </p>
                        <p className="text-[13px] text-ink-soft leading-snug group-hover:text-ink transition-colors duration-150 ease-ks">
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
      <div className="border-t border-rule bg-paper px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-[3px] border border-rule-strong bg-paper-raised focus-within:border-ink transition-colors duration-150 ease-ks">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your exam… (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none leading-relaxed"
              style={{ maxHeight: 140, minHeight: 44 }}
              disabled={isLoading}
            />
            <div className="flex items-center gap-2 px-3 pb-3 pt-1">
              <span className="ks-tag">
                <Brain className="h-3 w-3" />
                {examLabel}
              </span>
              <AiUsageIndicator />
              <div className="flex-1" />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || remaining === 0}
                className="btn-ink btn-sm !rounded-[3px] !text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-paper/30 border-t-paper animate-spin" />
                    Thinking…
                  </>
                ) : (
                  <>Ask <Send className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-ink-muted mt-2">
            Remi may make mistakes — verify important facts before the exam.
          </p>
        </div>
      </div>
    </div>
  );
}
