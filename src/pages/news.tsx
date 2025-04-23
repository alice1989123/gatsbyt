"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import NewsComponent from '../app/components/newsComponent';
import styles from './news.module.css';
import { NewsItem } from '../types/types';
import '../app/globals.css';

const api = '/api/proxy';

const About = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${api}?resource=news`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setNews(data.news);
        setSentiment(data.sentiment);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.page}>
        <h1 className={styles.title}>Crypto News Digest</h1>
        <p className={styles.subtitle}>
          Curated from trusted sources and summarized using <strong>Artificial Intelligence</strong>.
        </p>

        <div className={styles.container}>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : (
            <NewsComponent news={news} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
