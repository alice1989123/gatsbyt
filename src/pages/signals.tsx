"use client";

import coins from "@/app/coins";
import React, { useEffect, useMemo, useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import styles from "./signals.module.css";
import "../app/globals.css";
import { useSignalQuery } from "@/hooks/useSignalQuery";

type Signal = {
  coin: string;
  model_name: string;
  created_at: string; // ISO
  action: "BUY" | "SHORT" | string;
  entry?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
};

type SortOption =
  | "newest"
  | "oldest"
  | "coin_az"
  | "entry_desc"
  | "entry_asc"
  | "tp_desc"
  | "tp_asc";

type WindowOption = "12h" | "24h" | "7d";

type Prefs = {
  q: string;
  action: "ALL" | "BUY" | "SHORT";
  coin: string; // "ALL" or coin
  model: string; // "ALL" or model
  sort: SortOption;
  window: WindowOption;
  favOnly: boolean;
};

const DEFAULT_PREFS: Prefs = {
  q: "",
  action: "ALL",
  coin: "ALL",
  model: "ALL",
  sort: "newest",
  window: "12h",
  favOnly: false,
};

const get_icon = (coin: string) => {
  const coinData = coins.find((c) => c.symbol === coin);
  return coinData?.coinpng ?? "/icons/btc.png";
};

/**
 * Best-effort: try to find a Cognito idToken in localStorage,
 * decode it, and return sub. If not found, fall back to "anon".
 */
function tryGetCognitoSubFromLocalStorage(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (!k.toLowerCase().includes("idtoken")) continue;

      const v = localStorage.getItem(k);
      if (!v) continue;
      if (!v.includes(".") || v.split(".").length !== 3) continue;

      const payloadB64Url = v.split(".")[1];
      const payloadB64 = payloadB64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(payloadB64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );

      const payload = JSON.parse(json);
      if (payload?.sub) return String(payload.sub);
    }
  } catch {
    // ignore
  }
  return null;
}

function hoursForWindow(w: WindowOption): number {
  if (w === "12h") return 12;
  if (w === "24h") return 24;
  return 24 * 7;
}

type SelectOption = { label: string; value: string; icon?: string };

function optionByValue(options: SelectOption[], value: string, fallbackIndex = 0): SelectOption {
  return options.find((o) => o.value === value) ?? options[fallbackIndex];
}

const OpenSignalsPage = () => {
  const openSignals = useSignalQuery("open_signals");
  const signals: Signal[] = (openSignals.data ?? []) as Signal[];

  // Personalization keys
  const [userKey, setUserKey] = useState<string>("signals_prefs_anon");
  const [favKey, setFavKey] = useState<string>("signals_favs_anon");

  // Preferences state
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  // Favorites (coin-level)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // On mount: determine user sub + load prefs/favs
  useEffect(() => {
    const sub = tryGetCognitoSubFromLocalStorage();
    const k1 = `signals_prefs_${sub ?? "anon"}`;
    const k2 = `signals_favs_${sub ?? "anon"}`;
    setUserKey(k1);
    setFavKey(k2);

    // load prefs
    try {
      const raw = localStorage.getItem(k1);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore
    }

    // load favorites
    try {
      const rawFavs = localStorage.getItem(k2);
      if (rawFavs) {
        const arr = JSON.parse(rawFavs);
        if (Array.isArray(arr)) setFavorites(new Set(arr.map(String)));
      }
    } catch {
      // ignore
    }
  }, []);

  // persist prefs
  useEffect(() => {
    try {
      localStorage.setItem(userKey, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs, userKey]);

  // persist favorites
  useEffect(() => {
    try {
      localStorage.setItem(favKey, JSON.stringify(Array.from(favorites)));
    } catch {
      // ignore
    }
  }, [favorites, favKey]);

  const nowMs = Date.now();

  const filteredAndSorted = useMemo(() => {
    const q = prefs.q.trim().toLowerCase();
    const windowHours = hoursForWindow(prefs.window);
    const cutoff = nowMs - windowHours * 60 * 60 * 1000;

    let out = signals.filter((s) => {
      if (!s) return false;

      const t = new Date(s.created_at).getTime();
      if (!Number.isFinite(t) || t < cutoff) return false;

      if (prefs.action !== "ALL" && s.action !== prefs.action) return false;
      if (prefs.coin !== "ALL" && s.coin !== prefs.coin) return false;
      if (prefs.model !== "ALL" && s.model_name !== prefs.model) return false;
      if (prefs.favOnly && !favorites.has(s.coin)) return false;

      if (q) {
        const hay = `${s.coin} ${s.model_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    const num = (v: any) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);

    out.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();

      switch (prefs.sort) {
        case "newest":
          return tb - ta;
        case "oldest":
          return ta - tb;
        case "coin_az":
          return String(a.coin).localeCompare(String(b.coin));
        case "entry_desc":
          return (num(b.entry) || -Infinity) - (num(a.entry) || -Infinity);
        case "entry_asc":
          return (num(a.entry) || Infinity) - (num(b.entry) || Infinity);
        case "tp_desc":
          return (num(b.take_profit) || -Infinity) - (num(a.take_profit) || -Infinity);
        case "tp_asc":
          return (num(a.take_profit) || Infinity) - (num(b.take_profit) || Infinity);
        default:
          return tb - ta;
      }
    });

    return out;
  }, [signals, prefs, favorites, nowMs]);

  const toggleFavorite = (coin: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(coin)) next.delete(coin);
      else next.add(coin);
      return next;
    });
  };

  const clearFilters = () => setPrefs(DEFAULT_PREFS);

  const hasActiveFilters =
    prefs.q.trim() !== "" ||
    prefs.action !== "ALL" ||
    prefs.coin !== "ALL" ||
    prefs.model !== "ALL" ||
    prefs.sort !== "newest" ||
    prefs.window !== "12h" ||
    prefs.favOnly;

  /** ---------- CustomSelect OPTIONS (standardized) ---------- */

  // Coin options (icons)
  const coinOptions: SelectOption[] = useMemo(() => {
    // Use coins catalogue (so icons always exist), but still allow "ALL"
    const base = coins
      .map((c) => ({
        label: c.symbol, // keep it short for controls
        value: c.symbol,
        icon: c.coinpng,
      }))
      .sort((a, b) => a.value.localeCompare(b.value));

    return [{ label: "All coins", value: "ALL", icon: "/icons/default.png" }, ...base];
  }, []);

  // Model options (no icons)
  const modelOptions: SelectOption[] = useMemo(() => {
    const s = new Set<string>();
    for (const x of signals) if (x?.model_name) s.add(x.model_name);
    const list = Array.from(s).sort();
    return [{ label: "All models", value: "ALL" }, ...list.map((m) => ({ label: m, value: m }))];
  }, [signals]);

  // Window options
  const windowOptions: SelectOption[] = useMemo(
    () => [
      { label: "Last 12h", value: "12h" },
      { label: "Last 24h", value: "24h" },
      { label: "Last 7d", value: "7d" },
    ],
    []
  );

  // Sort options
  const sortOptions: SelectOption[] = useMemo(
    () => [
      { label: "Sort: Newest", value: "newest" },
      { label: "Sort: Oldest", value: "oldest" },
      { label: "Sort: Coin A→Z", value: "coin_az" },
      { label: "Sort: Entry High→Low", value: "entry_desc" },
      { label: "Sort: Entry Low→High", value: "entry_asc" },
      { label: "Sort: Take Profit High→Low", value: "tp_desc" },
      { label: "Sort: Take Profit Low→High", value: "tp_asc" },
    ],
    []
  );

  // Current select values
  const coinValue = optionByValue(coinOptions, prefs.coin, 0);
  const modelValue = optionByValue(modelOptions, prefs.model, 0);
  const windowValue = optionByValue(windowOptions, prefs.window, 0);
  const sortValue = optionByValue(sortOptions, prefs.sort, 0);

  return (
    <div className={styles.wrapper}>

      <main className={styles.contentWrapper}>
        <section className={styles.container}>
          <header className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>Open Signals</h2>

            <p className={styles.resultsSubtitle}>
              Live trade setups generated recently. Review entry, risk, and targets before acting.
            </p>

            <div className={styles.headerPill}>
              <span className={styles.pillDot} />
              Updated in real time • last {prefs.window} window
            </div>
          </header>

          {openSignals.loading ? (
            <p>Loading open signals...</p>
          ) : openSignals.error ? (
            <p>Error loading signals.</p>
          ) : (
            <section className={styles.statsSection}>
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.tableTitle}>Active Signals</h3>
                <div className={styles.countText}>
                  Showing <b>{filteredAndSorted.length}</b>
                </div>
              </div>

              {/* CONTROLS */}
              <div className={styles.controlsBar}>
                <div className={styles.controlsRow}>
                  <div className={styles.searchWrap}>
                    <input
                      className={styles.searchInput}
                      value={prefs.q}
                      onChange={(e) => setPrefs((p) => ({ ...p, q: e.target.value }))}
                      placeholder="Search coin or model… (e.g., THETA, GRU, RSI)"
                      aria-label="Search coin or model"
                    />
                  </div>

                  <div className={styles.pillGroup} role="group" aria-label="Action filter">
                    {(["ALL", "BUY", "SHORT"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={[
                          styles.pillButton,
                          prefs.action === v ? styles.pillActive : "",
                        ].join(" ")}
                        onClick={() => setPrefs((p) => ({ ...p, action: v }))}
                        aria-pressed={prefs.action === v}
                      >
                        {v === "ALL" ? "All" : v}
                      </button>
                    ))}

                    <button
                      type="button"
                      className={[
                        styles.pillButton,
                        prefs.favOnly ? styles.pillActive : "",
                      ].join(" ")}
                      onClick={() => setPrefs((p) => ({ ...p, favOnly: !p.favOnly }))}
                      aria-pressed={prefs.favOnly}
                      title="Show favorites only"
                    >
                      ★
                    </button>
                  </div>
                </div>

                <div className={styles.controlsRow}>
                  {/* Coin (icons) */}
                  <div className={styles.selectWrap} aria-label="Coin filter">
                    <CustomSelect
                      withIcons
                      options={coinOptions}
                      value={coinValue}
                      onChange={(opt: SelectOption) =>
                        setPrefs((p) => ({ ...p, coin: opt.value }))
                      }
                    />
                  </div>

                  {/* Model (no icons, same component = standardized) */}
                  <div className={styles.selectWrap} aria-label="Model filter">
                    <CustomSelect
                      options={modelOptions}
                      value={modelValue}
                      onChange={(opt: SelectOption) =>
                        setPrefs((p) => ({ ...p, model: opt.value }))
                      }
                    />
                  </div>

                  {/* Window */}
                  <div className={styles.selectWrap} aria-label="Time window">
                    <CustomSelect
                      options={windowOptions}
                      value={windowValue}
                      onChange={(opt: SelectOption) =>
                        setPrefs((p) => ({ ...p, window: opt.value as WindowOption }))
                      }
                    />
                  </div>

                  {/* Sort */}
                  <div className={styles.selectWrap} aria-label="Sort">
                    <CustomSelect
                      options={sortOptions}
                      value={sortValue}
                      onChange={(opt: SelectOption) =>
                        setPrefs((p) => ({ ...p, sort: opt.value as SortOption }))
                      }
                    />
                  </div>

                  {hasActiveFilters && (
                    <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* TABLE */}
              <div className={styles.scrollableTable}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Coin</th>
                      <th>Model</th>
                      <th>Created</th>
                      <th>Action</th>
                      <th>Entry</th>
                      <th>Stop Loss</th>
                      <th>Take Profit</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSorted.map((signal, index) => {
                      const isBuy = signal.action === "BUY";
                      const isFav = favorites.has(signal.coin);

                      return (
                        <tr key={index}>
                          <td className={styles.coinTd} data-label="Coin">
                            <div className={styles.coinCell}>
                              <img
                                src={get_icon(signal.coin)}
                                alt={`${signal.coin} icon`}
                                className={styles.coinIcon}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "/icons/default.png";
                                  e.currentTarget.style.objectFit = "contain";
                                }}
                              />

                              <div className={styles.coinSymbol}>
                                <span className={styles.coinTicker}>{signal.coin}</span>
                                <span className={styles.coinPairHint}>USDT</span>
                              </div>

                              <button
                                type="button"
                                className={[styles.starButton, isFav ? styles.starActive : ""].join(
                                  " "
                                )}
                                onClick={() => toggleFavorite(signal.coin)}
                                title={isFav ? "Unfavorite coin" : "Favorite coin"}
                                aria-label={isFav ? "Unfavorite coin" : "Favorite coin"}
                              >
                                ★
                              </button>

                              {/* Mobile-only action pill (top-right) */}
                              <span
                                className={[
                                  styles.badge,
                                  isBuy ? styles.badgeBuy : styles.badgeShort,
                                  styles.mobileActionPill,
                                ].join(" ")}
                              >
                                {signal.action}
                              </span>
                            </div>
                          </td>

                          <td data-label="Model">{signal.model_name}</td>

                          <td data-label="Created">{new Date(signal.created_at).toLocaleString()}</td>

                          {/* Desktop action column (hidden on mobile) */}
                          <td className={styles.actionRow} data-label="Action">
                            <span
                              className={[
                                styles.badge,
                                isBuy ? styles.badgeBuy : styles.badgeShort,
                              ].join(" ")}
                            >
                              {signal.action}
                            </span>
                          </td>

                          <td data-label="Entry">${signal.entry?.toFixed(2) ?? "-"}</td>
                          <td data-label="Stop Loss">${signal.stop_loss?.toFixed(2) ?? "-"}</td>
                          <td data-label="Take Profit">${signal.take_profit?.toFixed(2) ?? "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </section>
      </main>

    </div>
  );
};

export default OpenSignalsPage;
