import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Maximize2, MessageCircle, Minimize2, Send, X } from "lucide-react";
import { buildApiUrl } from "../../services/config";
import "./ChatWidget.css";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hello, I’m Julz Assistant. I can help you find packages, browse the catalog, or start a planning consultation. How may I help?",
};

const QUICK_QUESTIONS = [
  { label: "Browse packages", message: "What packages are listed on the website?" },
  { label: "Plan a consultation", message: "How do I request a planning consultation?" },
  { label: "Browse the catalog", message: "Where can I browse the product catalog?" },
];

const INTERNAL_PATH =
  /\/(?:plan|packages|catalog|obituaries|memorial|wall|eulogy|login|register|bookings|cart|checkout|booking-checkout|privacy|terms|refunds)(?:\/[A-Za-z0-9_-]+)*/;

function MessageContent({ content }) {
  const parts = content.split(/(\/(?:plan|packages|catalog|obituaries|memorial|wall|eulogy|login|register|bookings|cart|checkout|booking-checkout|privacy|terms|refunds)(?:\/[A-Za-z0-9_-]+)*)/g);
  return parts.map((part, index) =>
    INTERNAL_PATH.test(part) ? (
      <Link className="julz-chat__message-link" key={`${part}-${index}`} to={part}>
        {part}
      </Link>
    ) : (
      <span key={`text-${index}`}>{part}</span>
    ),
  );
}

export default function ChatWidget() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState("checking");
  const fabRef = useRef(null);
  const closeRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    fetch(buildApiUrl("/api/chat/status"), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("status"))))
      .then((data) => setAvailability(data.available ? "ready" : "unavailable"))
      .catch(() => setAvailability("offline"))
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      requestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const log = logRef.current;
    if (!log) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, isLoading, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      requestAnimationFrame(() => {
        if (availability === "ready") inputRef.current?.focus();
        else closeRef.current?.focus();
      });
    }
  }, [isOpen, isMinimized, availability]);

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    requestAnimationFrame(() => fabRef.current?.focus());
  };

  const sendMessage = async (messageText) => {
    const message = messageText.trim();
    if (!message || isLoading || availability !== "ready") return;

    setError("");
    setDraft("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setIsLoading(true);

    const controller = new AbortController();
    requestRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(buildApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          history: messages.slice(-8).map(({ role, content }) => ({ role, content })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 503 && /not configured/i.test(payload.message || "")) {
          setAvailability("unavailable");
        }
        if (response.status === 429) {
          const retrySeconds = Number(response.headers.get("Retry-After")) || 60;
          throw new Error(`Please wait ${retrySeconds} seconds before sending another message.`);
        }
        throw new Error(payload.message || "The assistant could not respond. Please try again shortly.");
      }
      if (typeof payload.reply !== "string" || !payload.reply.trim()) {
        throw new Error("The assistant returned an empty response. Please try again.");
      }
      setMessages((current) => [...current, { role: "assistant", content: payload.reply.trim() }]);
    } catch (requestError) {
      if (requestError.name === "AbortError") {
        setError("The request timed out. Please try again when your connection is ready.");
      } else {
        setError(requestError.message || "We could not connect. Please try again shortly.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (requestRef.current === controller) requestRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const statusText = {
    checking: "Checking availability",
    ready: "Ready to help",
    unavailable: "Currently unavailable",
    offline: "Connection unavailable",
  }[availability];

  return (
    <div className="julz-chat">
      {isOpen && (
        <section
          aria-labelledby="julz-chat-title"
          aria-modal="false"
          className={`julz-chat__drawer${isMinimized ? " julz-chat__drawer--minimized" : ""}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeChat();
          }}
          role="dialog"
        >
          <header className="julz-chat__header">
            <div className="julz-chat__identity">
              <span aria-hidden="true" className={`julz-chat__status julz-chat__status--${availability}`} />
              <div>
                <h2 id="julz-chat-title">Julz Assistant</h2>
                <p aria-live="polite" className="julz-chat__status-label">{statusText}</p>
              </div>
            </div>
            <div className="julz-chat__header-actions">
              <button
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                className="julz-chat__icon-button"
                onClick={() => setIsMinimized((current) => !current)}
                type="button"
              >
                {isMinimized ? <Maximize2 aria-hidden="true" size={18} /> : <Minimize2 aria-hidden="true" size={18} />}
              </button>
              <button aria-label="Close chat" className="julz-chat__icon-button" onClick={closeChat} ref={closeRef} type="button">
                <X aria-hidden="true" size={20} />
              </button>
            </div>
          </header>

          {isMinimized ? (
            <div className="julz-chat__minimized-content">
              <p>Your conversation is saved while you browse this site.</p>
              <button className="julz-chat__expand-button" onClick={() => setIsMinimized(false)} type="button">
                Continue conversation
              </button>
            </div>
          ) : (
            <>
              <div aria-label="Chat messages" aria-live="polite" aria-relevant="additions text" className="julz-chat__log" ref={logRef} role="log">
                {messages.map((item, index) => (
                  <div className={`julz-chat__message julz-chat__message--${item.role}`} key={`${item.role}-${index}`}>
                    <p><MessageContent content={item.content} /></p>
                  </div>
                ))}
                {messages.length === 1 && availability === "ready" && (
                  <div aria-label="Suggested questions" className="julz-chat__suggestions">
                    {QUICK_QUESTIONS.map((question) => (
                      <button key={question.label} onClick={() => sendMessage(question.message)} type="button">
                        {question.label}
                      </button>
                    ))}
                  </div>
                )}
                {isLoading && (
                  <div aria-label="Julz Assistant is responding" className="julz-chat__message julz-chat__message--assistant julz-chat__typing" role="status">
                    <LoaderCircle aria-hidden="true" className="julz-chat__spinner" size={17} />
                    <span>Preparing a response…</span>
                  </div>
                )}
              </div>

              {availability !== "ready" && (
                <p className="julz-chat__unavailable" role="status">
                  {availability === "checking"
                    ? "Connecting to the assistant…"
                    : "Chat is not available right now. You can browse our "}
                  {availability !== "checking" && <Link to="/packages">packages</Link>}
                  {availability !== "checking" && " or request a consultation at "}
                  {availability !== "checking" && <Link to="/plan">/plan</Link>}
                  {availability !== "checking" && "."}
                </p>
              )}

              {error && <p className="julz-chat__error" role="alert">{error}</p>}

              <form className="julz-chat__form" onSubmit={handleSubmit}>
                <label className="julz-chat__sr-only" htmlFor="julz-chat-input">Ask about packages, products, or planning</label>
                <input
                  aria-describedby="julz-chat-privacy"
                  autoComplete="off"
                  disabled={availability !== "ready" || isLoading}
                  id="julz-chat-input"
                  maxLength={1200}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={availability === "ready" ? "Ask about planning or the site…" : "Chat is unavailable"}
                  ref={inputRef}
                  value={draft}
                />
                <button
                  aria-label={isLoading ? "Sending message" : "Send message"}
                  className="julz-chat__send"
                  disabled={availability !== "ready" || isLoading || !draft.trim()}
                  type="submit"
                >
                  {isLoading ? <LoaderCircle aria-hidden="true" className="julz-chat__spinner" size={18} /> : <Send aria-hidden="true" size={18} />}
                </button>
              </form>
              <p className="julz-chat__privacy" id="julz-chat-privacy">
                Don’t share passwords, OTPs, payment details, or private memorial information. Messages stay in this browser session and are sent to our configured AI provider under that provider’s data terms.
              </p>
            </>
          )}
        </section>
      )}

      <button
        aria-controls="julz-chat-title"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Chat is open" : "Open Julz Assistant chat"}
        className="julz-chat__fab"
        onClick={() => (isOpen ? closeChat() : openChat())}
        ref={fabRef}
        type="button"
      >
        {isOpen ? <X aria-hidden="true" size={21} /> : <MessageCircle aria-hidden="true" size={22} />}
        <span>{isOpen ? "Close chat" : "Ask Julz"}</span>
      </button>
    </div>
  );
}
