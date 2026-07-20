import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Lightbulb,
  Shield,
  Activity,
  FileText,
  Wrench,
  History,
  Plus,
  Trash2,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import LoadingState from '../components/ui/LoadingState';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/ui/Avatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  pending?: boolean;
}

interface Suggestion {
  id: number;
  category: string;
  prompt: string;
}

export default function AICopilot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi, I'm the Protect AI Copilot. I can summarise incidents, draft reports, and answer operational questions once connected to your safety knowledge base. Until then, try one of the suggested prompts below.",
      ts: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<Suggestion[]>('/copilot').then(setSuggestions).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      ts: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const { reply } = await api.post<{ reply: string }>('/copilot', { message: trimmed });
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        ts: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, the Copilot is offline right now. Please try again later.',
        ts: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setSending(false);
    }
  };

  const initials = (user?.name || 'OP')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const categories = groupBy(suggestions || [], 'category');

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Copilot"
        subtitle="Conversational interface to your plant safety data — coming soon. UI shell is live for integration testing."
        meta={
          <span className="font-mono text-[11px] text-zinc-500">
            Model: <span className="text-zinc-300">pending integration</span> · v0.1
          </span>
        }
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3 w-3" />
              Preview
            </span>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 text-xs text-zinc-300 hover:bg-zinc-900">
              <History className="h-3.5 w-3.5" />
              History
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        {/* Chat */}
        <div className="surface-glass flex h-[640px] flex-col rounded-xl">
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Protect AI Copilot</p>
                <p className="font-mono text-[10.5px] text-zinc-500">
                  {sending ? 'Thinking…' : 'Ready · awaiting knowledge base connection'}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome',
                    role: 'assistant',
                    content:
                      "Hi, I'm the Protect AI Copilot. I can summarise incidents, draft reports, and answer operational questions once connected to your safety knowledge base.",
                    ts: new Date().toISOString(),
                  },
                ])
              }
              className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-2.5 text-[11px] text-zinc-300 hover:bg-zinc-900"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} userInitials={initials} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 pl-11 text-[11px] text-zinc-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                Copilot is composing a response…
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800/70 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about incidents, sensors, compliance…"
                rows={1}
                className="min-h-[40px] flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-cyan-500 to-sky-600 text-zinc-950 shadow-lg shadow-cyan-500/10 transition-all hover:from-cyan-400 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-1 px-1 text-[10.5px] text-zinc-600">
              Press <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 font-mono">Enter</kbd> to send ·{' '}
              <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1 font-mono">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>

        {/* Suggestions + capabilities */}
        <aside className="space-y-4">
          <div className="surface-glass rounded-xl p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Suggested prompts
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500">Tap any prompt to ask the Copilot.</p>
            <div className="mt-3 space-y-3">
              {!suggestions ? (
                <LoadingState label="Loading" rows={4} />
              ) : (
                Object.entries(categories).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                      {cat}
                    </p>
                    <ul className="space-y-1.5">
                      {items.map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => send(s.prompt)}
                            className="w-full rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2 text-left text-xs text-zinc-200 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5"
                          >
                            {s.prompt}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="surface-glass rounded-xl p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Shield className="h-4 w-4 text-emerald-400" />
              Capabilities
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2">
                <Activity className="mt-0.5 h-3.5 w-3.5 text-cyan-400" />
                Summarise incidents across zones and shifts
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-3.5 w-3.5 text-cyan-400" />
                Draft weekly compliance reports from raw data
              </li>
              <li className="flex items-start gap-2">
                <Wrench className="mt-0.5 h-3.5 w-3.5 text-cyan-400" />
                Recommend maintenance windows based on sensor trends
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 text-cyan-400" />
                Explain safety procedures using your knowledge base
              </li>
            </ul>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-900">
              <Plus className="h-3 w-3" />
              New conversation
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChatBubble({ message, userInitials }: { message: Message; userInitials: string }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? (
        <Avatar initials={userInitials} size="sm" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-gradient-to-br from-cyan-500/20 to-sky-600/15 text-cyan-50 ring-1 ring-cyan-500/30'
            : 'rounded-tl-sm border border-zinc-800 bg-zinc-900/50 text-zinc-100'
        }`}
      >
        <p>{message.content}</p>
        <p className={`mt-1 font-mono text-[10px] ${isUser ? 'text-cyan-200/70' : 'text-zinc-500'}`}>
          {new Date(message.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function groupBy<T extends Record<string, any>>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}