"use client";

import React, { FC, useMemo } from "react";
import styles from "./NewsComponent.module.css";

export type NewsItemLike = {
  article_id?: string;
  source?: string | null;
  url?: string | null;
  title?: string | null;
  summary?: string | null;

  extracted_at?: string | null;
  summarized_at?: string | null;
  created_at?: string | null;

  coins?: string[] | null;
  topics?: string[] | null;
  entities?: string[] | null;

  sentiment_label?: string | null;
  sentiment_score?: number | null;

  cluster_id?: string | null;
};

type SortMode = "newest" | "oldest";

type BaseProps = { news: NewsItemLike[] };

type FiltersModeProps = BaseProps & {
  mode: "filters";
  selectedCoin: string | null;
  selectedTopic: string | null;
  onSelectCoin: (coin: string | null) => void;
  onSelectTopic: (topic: string | null) => void;
  onClearCoin: () => void;
  onClearTopic: () => void;
};

type FeedModeProps = BaseProps & {
  mode: "feed";
  query?: string;
  selectedCoin?: string | null;
  selectedTopic?: string | null;
  sortBy?: SortMode;
  groupSimilar?: boolean;
};

type NewsComponentProps = FiltersModeProps | FeedModeProps;

function safeDate(value: any): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeText(s?: string) {
  return (s ?? "").toString().trim().toLowerCase();
}

function getHeadline(item: NewsItemLike) {
  return (item.title ?? "").trim() || "Untitled";
}

function getSummary(item: NewsItemLike) {
  return (item.summary ?? "").trim();
}

function getDateRaw(item: NewsItemLike) {
  // prefer summarized_at, fallback extracted_at, fallback created_at
  return item.summarized_at ?? item.extracted_at ?? item.created_at ?? "";
}

function getCoins(item: NewsItemLike): string[] {
  const coins = item.coins ?? [];
  return Array.isArray(coins) ? coins.filter(Boolean).map((c) => String(c).toUpperCase()) : [];
}

function getTopics(item: NewsItemLike): string[] {
  const topics = item.topics ?? [];
  return Array.isArray(topics) ? topics.filter(Boolean).map((t) => String(t)) : [];
}

function getClusterKey(item: NewsItemLike): string {
  return item.cluster_id || item.article_id || item.url || getHeadline(item);
}

const NewsComponent: FC<NewsComponentProps> = (props) => {
  const { news } = props;

  // ---------- FILTERS MODE (sidebar) ----------
  if (props.mode === "filters") {
    const { selectedCoin, selectedTopic, onSelectCoin, onSelectTopic, onClearCoin, onClearTopic } =
      props;

    const coinOptions = useMemo(() => {
      const counts = new Map<string, number>();
      for (const item of news ?? []) {
        for (const c of getCoins(item)) {
          counts.set(c, (counts.get(c) ?? 0) + 1);
        }
      }
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([coin, count]) => ({ coin, count }));
    }, [news]);

    const topicOptions = useMemo(() => {
      const counts = new Map<string, number>();
      for (const item of news ?? []) {
        for (const t of getTopics(item)) {
          counts.set(t, (counts.get(t) ?? 0) + 1);
        }
      }
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([topic, count]) => ({ topic, count }));
    }, [news]);

    return (
      <div className={styles.filters}>
        <div className={styles.filtersSection}>
          <div className={styles.filtersHeader}>
            <div className={styles.filtersTitle}>Coins</div>
            {selectedCoin && (
              <button className={styles.clearPill} type="button" onClick={onClearCoin}>
                Clear
              </button>
            )}
          </div>

          {coinOptions.length === 0 ? (
            <div className={styles.muted}>No coin tags yet.</div>
          ) : (
            <div className={styles.pills}>
              {coinOptions.slice(0, 20).map(({ coin, count }) => {
                const active = selectedCoin === coin;
                return (
                  <button
                    key={coin}
                    type="button"
                    className={`${styles.pillBtn} ${active ? styles.pillActive : ""}`}
                    onClick={() => onSelectCoin(active ? null : coin)}
                    title={`${count} stories`}
                  >
                    {coin} <span className={styles.pillCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.filtersSection}>
          <div className={styles.filtersHeader}>
            <div className={styles.filtersTitle}>Topics</div>
            {selectedTopic && (
              <button className={styles.clearPill} type="button" onClick={onClearTopic}>
                Clear
              </button>
            )}
          </div>

          {topicOptions.length === 0 ? (
            <div className={styles.muted}>No topics yet.</div>
          ) : (
            <div className={styles.pills}>
              {topicOptions.slice(0, 20).map(({ topic, count }) => {
                const active = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    className={`${styles.pillBtn} ${active ? styles.pillActive : ""}`}
                    onClick={() => onSelectTopic(active ? null : topic)}
                    title={`${count} stories`}
                  >
                    {topic} <span className={styles.pillCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- FEED MODE (main list) ----------
  const query = props.query ?? "";
  const selectedCoin = props.selectedCoin ?? null;
  const selectedTopic = props.selectedTopic ?? null;
  const sortBy: SortMode = props.sortBy ?? "newest";
  const groupSimilar = props.groupSimilar ?? false;

  const filtered = useMemo(() => {
    const q = normalizeText(query);

    let list = (news ?? []).filter((item) => {
      const headline = getHeadline(item);
      const summary = getSummary(item);
      const topics = getTopics(item);
      const coins = getCoins(item);
      const entities = Array.isArray(item.entities) ? item.entities.join(" ") : "";

      // text search across title/summary/topics/coins/entities
      if (q) {
        const hay = normalizeText(
          `${headline} ${summary} ${topics.join(" ")} ${coins.join(" ")} ${entities}`
        );
        if (!hay.includes(q)) return false;
      }

      if (selectedTopic && !topics.includes(selectedTopic)) return false;
      if (selectedCoin && !coins.includes(selectedCoin)) return false;

      return true;
    });

    // sort
    list.sort((a, b) => {
      const da = safeDate(getDateRaw(a))?.getTime() ?? 0;
      const db = safeDate(getDateRaw(b))?.getTime() ?? 0;
      return sortBy === "newest" ? db - da : da - db;
    });

    // group by cluster_id (narrative) if enabled
    if (groupSimilar) {
      const groups = new Map<string, NewsItemLike[]>();
      for (const item of list) {
        const k = getClusterKey(item);
        const arr = groups.get(k) ?? [];
        arr.push(item);
        groups.set(k, arr);
      }

      // representative = newest item in each group (list already sorted)
      const out: Array<NewsItemLike & { _clusterSize?: number }> = [];
      for (const [_, items] of groups.entries()) {
        out.push({ ...items[0], _clusterSize: items.length });
      }

      // keep ordering stable by date again
      out.sort((a, b) => {
        const da = safeDate(getDateRaw(a))?.getTime() ?? 0;
        const db = safeDate(getDateRaw(b))?.getTime() ?? 0;
        return sortBy === "newest" ? db - da : da - db;
      });

      return out;
    }

    return list;
  }, [news, query, selectedCoin, selectedTopic, sortBy, groupSimilar]);

  if (filtered.length === 0) {
    return <p className={styles.empty}>No matching news.</p>;
  }

  return (
    <div className={styles.container}>
      {filtered.map((item: any, index: number) => {
        const headline = getHeadline(item);
        const summary = getSummary(item);

        const d = safeDate(getDateRaw(item));
        const dateText = d
          ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
          : "Unknown date";

        const domain = (() => {
          if (!item.url) return "";
          try {
            return new URL(item.url).hostname.replace("www.", "");
          } catch {
            return "";
          }
        })();

        const coins = getCoins(item).slice(0, 6);
        const topics = getTopics(item).slice(0, 4);
        const clusterSize = item._clusterSize ?? 1;

        return (
          <article key={`${item.article_id ?? item.url ?? headline}-${index}`} className={styles.newsItem}>
            <div className={styles.headerRow}>
              <div className={styles.titleCol}>
                <a
                  className={styles.headline}
                  href={item.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open article"
                >
                  {headline}
                </a>

                {(coins.length > 0 || topics.length > 0 || clusterSize > 1) && (
                  <div className={styles.chipsRow}>
                    {coins.map((c: string) => (
                      <span key={c} className={styles.chip}>
                        {c}
                      </span>
                    ))}
                    {topics.map((t: string) => (
                      <span key={t} className={styles.chipSoft}>
                        {t}
                      </span>
                    ))}
                    {clusterSize > 1 ? (
                      <span className={styles.chipSoft}>Cluster ×{clusterSize}</span>
                    ) : null}
                  </div>
                )}
              </div>

              {item.url ? (
                <a className={styles.openBtn} href={item.url} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
              ) : null}
            </div>

            {summary ? <p className={styles.summary}>{summary}</p> : null}

            <div className={styles.metaRow}>
              <span className={styles.date}>{dateText}</span>
              {domain ? <span className={styles.domain}>{domain}</span> : <span />}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default NewsComponent;
