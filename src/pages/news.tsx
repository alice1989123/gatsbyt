// pages/news.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import NewsComponent from "../components/newsComponent";
import styles from "./news.module.css";
import dynamic from "next/dynamic";
import type { SortOption } from "@/components/NewsSortSelect";

const NewsSortSelect = dynamic(() => import("@/components/NewsSortSelect"), {
  ssr: false,
});

const SORT_OPTIONS: SortOption[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];  

const api = "/api/proxy";


export type NewsItemDB = {
  article_id: string;
  source?: string | null;
  url?: string | null;
  title?: string | null;
  raw_path?: string | null;

  extracted_at?: string | null;
  summarized_at?: string | null;

  summary?: string | null;

  coins?: string[] | null;
  topics?: string[] | null;
  entities?: string[] | null;

  sentiment_label?: string | null;
  sentiment_score?: number | null;

  cluster_id?: string | null;

  status?: string | null;
  error?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

const NewsPage = () => {
  const [news, setNews] = useState<NewsItemDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // UX state
  const [query, setQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [groupSimilar, setGroupSimilar] = useState(true);



 const sortValue = useMemo(
  () => SORT_OPTIONS.find((o) => o.value === sortBy) ?? SORT_OPTIONS[0],
  [sortBy]
  );


  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${api}?resource=news`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        setNews(Array.isArray(data?.news) ? data.news : []);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const resultsLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (error) return "Unavailable";
    const n = news?.length ?? 0;

    const parts: string[] = [];
    parts.push(`${n} stories`);
    if (selectedCoin) parts.push(`coin: ${selectedCoin}`);
    if (selectedTopic) parts.push(`topic: ${selectedTopic}`);
    if (query.trim()) parts.push(`search: “${query.trim()}”`);

    return parts.join(" • ");
  }, [loading, error, news, selectedCoin, selectedTopic, query]);

  const resetAll = () => {
    setSelectedCoin(null);
    setSelectedTopic(null);
    setQuery("");
    setGroupSimilar(true);
    setSortBy("newest");
  };

  return (
    <div className={styles.wrapper}>

      <main className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroCard}>
            <h1 className={styles.title}>Market-Moving News</h1>

            <p className={styles.subtitle}>
              Curated narratives, grouped by similarity—scan faster and act with confidence.
            </p>

            <div className={styles.valueRow}>
              <span className={styles.pill}>Grouped narratives</span>
              <span className={styles.pill}>De-duplicated sources</span>
              <span className={styles.pill}>Fast scanning</span>
              <span className={styles.pill}>One-click open</span>
            </div>

            <div className={styles.topbar}>
              <div className={styles.searchWrap}>
                <input
                  className={styles.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stories, coins, topics…"
                  aria-label="Search news"
                />
                {query && (
                  <button
                    className={styles.clearBtn}
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className={styles.topbarControls}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={groupSimilar}
                    onChange={(e) => setGroupSimilar(e.target.checked)}
                  />
                  <span>Group by narrative</span>
                </label>

                <div className={styles.sortShell} aria-label="Sort">
                  <NewsSortSelect
                  options={SORT_OPTIONS}
                  value={sortValue}
                  onChange={(selected) => setSortBy(selected.value)}
                  width="100%"
                  usePortal
                />
                </div>

                <button className={styles.ghostBtn} type="button" onClick={resetAll}>
                  Reset
                </button>
              </div>
            </div>

            <div className={styles.resultsMeta}>{resultsLabel}</div>
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <NewsComponent
              mode="filters"
              news={news}
              selectedCoin={selectedCoin}
              selectedTopic={selectedTopic}
              onSelectCoin={setSelectedCoin}
              onSelectTopic={setSelectedTopic}
              onClearCoin={() => setSelectedCoin(null)}
              onClearTopic={() => setSelectedTopic(null)}
            />

            <div className={styles.sidebarHint}>
              Tip: start with a coin filter, then scan only “High-signal” topics like{" "}
              <b>Regulation</b>, <b>Security</b>, <b>ETFs</b>.
            </div>
          </aside>

          <section className={styles.feed}>
            {loading ? (
              <div className={styles.skeletonList}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            ) : error ? (
              <div className={styles.stateBox}>
                <div className={styles.stateTitle}>Couldn’t load news</div>
                <div className={styles.stateText}>{error.message}</div>
              </div>
            ) : (
              <NewsComponent
                mode="feed"
                news={news}
                query={query}
                selectedCoin={selectedCoin}
                selectedTopic={selectedTopic}
                sortBy={sortBy}
                groupSimilar={groupSimilar}
              />
            )}
          </section>
        </div>
      </main>

    </div>
  );
};

export default NewsPage;
