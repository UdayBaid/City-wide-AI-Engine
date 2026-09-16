import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';

const SUGGESTIONS = [
  "What is the protocol for a blacklisted vehicle?",
  "Which cameras are currently offline?",
  "How do I handle a speed violation alert?",
  "What are peak traffic hours in Delhi?",
  "How does ANPR accuracy vary by camera?",
];

export default function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: "Hello! I'm the City-wide AI Operations Assistant \nI can help you with camera protocols, alert procedures, traffic analysis, and vehicle tracking. How can I assist you?",
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Check backend health on mount
  useEffect(() => {
    api.health()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = { role: 'user', parts: userText, sources: [] };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    
    const history = messages
      .slice(1)
      .map(m => ({ role: m.role, parts: m.parts }));

    try {
      const data = await api.chat(userText, history);
      setMessages(prev => [
        ...prev,
        { role: 'model', parts: data.answer, sources: data.sources || [] },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          parts: `⚠️ Error: ${err.message}\n\nMake sure the FastAPI backend is running on port 8000 and your GEMINI_API_KEY is set.`,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.statusDot(backendOnline)} />
            <div>
              <div style={styles.headerTitle}>AI Operations Assistant</div>
              <div style={styles.headerSub}>
                {backendOnline === null ? 'Connecting...' : backendOnline ? 'Backend Online · RAG Active' : '⚠ Backend Offline'}
              </div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={styles.msgRow(msg.role)}>
              <div style={styles.avatar(msg.role)}>
                {msg.role === 'model' ? '🤖' : '👤'}
              </div>
              <div style={styles.bubble(msg.role)}>
                <pre style={styles.msgText}>{msg.parts}</pre>
                {}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={styles.sources}>
                    <span style={styles.sourcesLabel}>📚 Sources:</span>
                    {msg.sources.map((s, si) => (
                      <span key={si} style={styles.sourceTag}>{s.title}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={styles.msgRow('model')}>
              <div style={styles.avatar('model')}>🤖</div>
              <div style={styles.bubble('model')}>
                <div style={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {}
        {messages.length <= 1 && (
          <div style={styles.suggestions}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} style={styles.suggBtn} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {}
        <div style={styles.inputRow}>
          <textarea
            ref={inputRef}
            style={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about protocols, cameras, alerts, vehicles..."
            rows={2}
            disabled={loading || backendOnline === false}
          />
          <button
            style={styles.sendBtn(loading || !input.trim())}
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}


const styles = {
  overlay: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
  },
  panel: {
    width: 420, height: 600,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: 16,
    boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'rgba(59,130,246,0.08)',
    borderBottom: '1px solid rgba(59,130,246,0.2)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  statusDot: (online) => ({
    width: 10, height: 10, borderRadius: '50%',
    background: online === true ? '#22c55e' : online === false ? '#ef4444' : '#f59e0b',
    boxShadow: online === true ? '0 0 8px #22c55e' : 'none',
    flexShrink: 0,
  }),
  headerTitle: { color: '#e2e8f0', fontWeight: 700, fontSize: 14 },
  headerSub: { color: '#64748b', fontSize: 11, marginTop: 2 },
  closeBtn: {
    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#ef4444', borderRadius: 8, padding: '4px 10px',
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '12px 12px',
    display: 'flex', flexDirection: 'column', gap: 12,
    scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent',
  },
  msgRow: (role) => ({
    display: 'flex', flexDirection: role === 'user' ? 'row-reverse' : 'row',
    alignItems: 'flex-start', gap: 8,
  }),
  avatar: (role) => ({
    fontSize: 18, flexShrink: 0, marginTop: 2,
    background: role === 'model' ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)',
    borderRadius: 8, padding: '4px 6px',
  }),
  bubble: (role) => ({
    maxWidth: '80%',
    background: role === 'model'
      ? 'rgba(30,41,59,0.9)'
      : 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.25))',
    border: role === 'model'
      ? '1px solid rgba(71,85,105,0.5)'
      : '1px solid rgba(99,102,241,0.4)',
    borderRadius: role === 'model' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
    padding: '10px 12px',
  }),
  msgText: {
    color: '#cbd5e1', fontSize: 13, margin: 0,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6,
  },
  sources: { marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  sourcesLabel: { color: '#64748b', fontSize: 10, marginRight: 2 },
  sourceTag: {
    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
    color: '#93c5fd', borderRadius: 4, padding: '1px 6px', fontSize: 10,
  },
  typing: {
    display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0',
  },
  suggestions: {
    padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4,
    borderTop: '1px solid rgba(71,85,105,0.3)',
  },
  suggBtn: {
    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
    color: '#93c5fd', borderRadius: 8, padding: '6px 10px',
    cursor: 'pointer', textAlign: 'left', fontSize: 11,
    transition: 'all 0.2s',
  },
  inputRow: {
    display: 'flex', alignItems: 'flex-end', gap: 8,
    padding: '10px 12px', borderTop: '1px solid rgba(71,85,105,0.4)',
    background: 'rgba(15,23,42,0.5)',
  },
  textarea: {
    flex: 1, background: 'rgba(30,41,59,0.8)',
    border: '1px solid rgba(71,85,105,0.5)', borderRadius: 10,
    color: '#e2e8f0', padding: '8px 12px', fontSize: 13,
    resize: 'none', outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5,
  },
  sendBtn: (disabled) => ({
    width: 40, height: 40, borderRadius: 10, border: 'none',
    background: disabled
      ? 'rgba(71,85,105,0.4)'
      : 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: disabled ? '#475569' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 16, flexShrink: 0,
    transition: 'all 0.2s',
  }),
};
