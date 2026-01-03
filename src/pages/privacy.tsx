import Head from "next/head";
import Link from "next/link";
import styles from "./privacy.module.css";

export default function PrivacyPage() {
  const updated = "January 2026";

  return (
    <div className={styles.wrapper}>
      <Head>
        <title>Privacy Policy | Gatsbyt</title>
        <meta name="description" content="Privacy Policy for Gatsbyt." />
      </Head>


      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.meta}>Last updated: {updated}</p>

          <section className={styles.card}>
            <h2>Who we are</h2>
            <p>
              Gatsbyt provides crypto dashboards such as forecasts, signals, performance analytics,
              on-chain indicators, and an AI news digest. This policy explains what data we collect,
              how we use it, and the choices you may have.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Information we collect</h2>
            <ul>
              <li>
                <b>Account information:</b> when you sign in, we may receive your email address and
                basic profile details from your identity provider (for example, Google via Amazon
                Cognito). Gatsbyt does not receive or store your identity provider password.
              </li>
              <li>
                <b>Usage and device data:</b> basic logs needed to operate, secure, and debug the
                service (for example, request metadata, timestamps, approximate location from IP,
                device/browser information, and error logs).
              </li>
              <li>
                <b>Contact requests:</b> information you submit if you contact support (for example,
                name, email, and message content).
              </li>
              <li>
                <b>Optional content you provide:</b> if you submit feedback or other information,
                we will process it to respond or improve the service.
              </li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>How we use information</h2>
            <ul>
              <li>Provide and secure access to Gatsbyt features.</li>
              <li>Operate, maintain, and improve reliability and performance.</li>
              <li>Prevent abuse, fraud, and unauthorized access.</li>
              <li>Respond to support requests and service communications.</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>Email communications</h2>
            <p>
              Gatsbyt sends only user-initiated and account-related transactional emails, such as
              contact replies, account verification, password resets, and service alerts that you
              enable. We do not send unsolicited marketing emails or use purchased email lists.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Cookies and similar technologies</h2>
            <p>
              We use cookies or similar technologies that are necessary for authentication and
              security (for example, to keep your session active). Depending on your setup, we may
              also use limited telemetry to improve reliability and prevent abuse.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Sharing and third parties</h2>
            <p>
              Gatsbyt uses infrastructure providers to operate the service (for example, hosting,
              authentication, email delivery, and logging). These providers process data on our
              behalf to provide the service.
            </p>
            <p>
              We may disclose information if required by law, to protect the security of Gatsbyt, or
              to enforce our{" "}
              <Link className={styles.link} href="/terms">
                Terms
              </Link>
              .
            </p>
            <p>
              <b>We do not sell your personal information.</b>
            </p>
          </section>

          <section className={styles.card}>
            <h2>Data retention</h2>
            <p>
              We retain personal information only as long as reasonably necessary to operate the
              service, meet legal obligations, resolve disputes, enforce agreements, and protect
              Gatsbyt and its users. Support messages may be retained for continuity and audit
              purposes.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Your choices</h2>
            <ul>
              <li>
                You may contact us to request access, correction, or deletion of your account data,
                subject to legal and operational requirements.
              </li>
              <li>
                You can stop using the service at any time. Some data (such as security logs) may be
                retained for a limited period for safety and compliance.
              </li>
            </ul>
          </section>

          <section className={styles.card}>
            <h2>Children’s privacy</h2>
            <p>
              Gatsbyt is not intended for use by children. If you believe a child has provided
              personal information, contact us and we will take reasonable steps to delete it.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If changes are material, we will
              post the updated policy and update the “Last updated” date above.
            </p>
          </section>

          <section className={styles.card}>
            <h2>Contact</h2>
            <p>
              For privacy questions, contact{" "}
              <a className={styles.link} href="mailto:support@gatsbyt.com">
                support@gatsbyt.com
              </a>
              .
            </p>
            <p className={styles.small}>
              Also see <Link className={styles.link} href="/terms">Terms</Link> and{" "}
              <Link className={styles.link} href="/contact">Contact</Link>.
            </p>
          </section>
        </div>
      </main>

    </div>
  );
}
