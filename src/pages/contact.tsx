import React, { useState } from "react";
import styles from "./contact.module.css";
import Link from "next/link";
type ContactTopic = "Support" | "Bug report" | "Feature request" | "Partnership" | "Other";

export default function ContactPage() {
  const [topic, setTopic] = useState<ContactTopic>("Support");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);

    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      topic: String(form.get("topic") || ""),
      message: String(form.get("message") || ""),
    };

    try {
      // You can implement this API later. For now it can return 200.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed (${res.status})`);
      }

      setStatus("sent");
      (e.target as HTMLFormElement).reset();
      setTopic("Support");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Please email us directly.");
    }
  }

  return (
    <div className={styles.wrapper}>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.badge}>Contact</div>
          <h1 className={styles.title}>Talk to Gatsbyt</h1>
          <p className={styles.subtitle}>
            Need help, found a bug, or want a feature? Send a message and we’ll get back to you.
          </p>

          <div className={styles.quickRow}>
            <div className={styles.quickCard}>
              <div className={styles.quickLabel}>Email</div>
              <a className={styles.quickValue} href="mailto:support@gatsbyt.com">
                support@gatsbyt.com
              </a>
              <div className={styles.quickHint}>Typical response: 1–2 business days</div>
            </div>

            <div className={styles.quickCard}>
              <div className={styles.quickLabel}>Security</div>
              <div className={styles.quickValuePlain}>No passwords via email</div>
              <div className={styles.quickHint}>
                For account issues, include your username/email — never your password or API keys.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          {/* Contact form */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Send a message</h2>
              <div className={styles.cardSub}>
                This form sends to our support inbox.
              </div>
            </div>

            <form className={styles.form} onSubmit={onSubmit}>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <input
                    className={styles.input}
                    name="name"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Topic</span>
                <select
                  className={styles.select}
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as ContactTopic)}
                >
                  <option>Support</option>
                  <option>Bug report</option>
                  <option>Feature request</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Message</span>
                <textarea
                  className={styles.textarea}
                  name="message"
                  placeholder="Tell us what you need. If it’s a bug, include steps to reproduce."
                  rows={6}
                  required
                />
              </label>

              <div className={styles.actions}>
                <button
                  className={styles.primaryBtn}
                  type="submit"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>

                <div className={styles.miniNote}>
                  By sending, you agree to our{" "}
                  <div className={styles.miniNote}>
                    By sending, you agree to our{" "}
                    <Link className={styles.inlineLink} href="/privacy">
                      Privacy Policy
                    </Link>
                    .
                  </div>
                </div>
              </div>

              {status === "sent" && (
                <div className={styles.alertSuccess}>
                  Message received. We’ll reply soon.
                </div>
              )}

              {status === "error" && (
                <div className={styles.alertError}>
                  {errorMsg} You can also email{" "}
                  <a className={styles.inlineLink} href="mailto:support@gatsbyt.com">
                    support@gatsbyt.com
                  </a>.
                </div>
              )}
            </form>
          </div>

          {/* FAQ / help */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Common questions</h2>
              <div className={styles.cardSub}>Fast answers before you wait for a reply.</div>
            </div>

            <div className={styles.faq}>
              <details className={styles.faqItem}>
                <summary>How do I sign in?</summary>
                <div className={styles.faqBody}>
                  Gatsbyt uses Cognito Hosted UI with Google login. Click “Sign in” and follow the prompt.
                </div>
              </details>

              <details className={styles.faqItem}>
                <summary>Can you reset my password?</summary>
                <div className={styles.faqBody}>
                  We don’t store passwords. If you used Google login, reset is handled by Google.
                </div>
              </details>

              <details className={styles.faqItem}>
                <summary>I found a bug — what info helps?</summary>
                <div className={styles.faqBody}>
                  Include the page, steps to reproduce, your browser/device, and (if possible) a screenshot.
                </div>
              </details>

              <details className={styles.faqItem}>
                <summary>Do you send marketing emails?</summary>
                <div className={styles.faqBody}>
                  Not today. Emails are for support and account/service notifications only.
                </div>
              </details>
            </div>

            <div className={styles.divider} />

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.metaKey}>Support hours</span>
                <span className={styles.metaVal}>Mon–Fri (local time)</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaKey}>Response target</span>
                <span className={styles.metaVal}>1–2 business days</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaKey}>Security</span>
                <span className={styles.metaVal}>Never share passwords / API keys</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
