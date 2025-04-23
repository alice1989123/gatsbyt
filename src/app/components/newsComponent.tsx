"use client"
import React from 'react';
import { FC } from 'react';
import styles from './NewsComponent.module.css';
import { NewsItem } from 'src/types/types';

type NewsComponentProps = {
  news: NewsItem[];
};

const NewsComponent: FC<NewsComponentProps> = ({ news }) => (
  <div className={styles.container}>
    {news.length === 0 ? (
      <p className={styles.empty}>No news available.</p>
    ) : (
      news.map((item, index) => (
        <div key={index} className={styles.newsItem}>
          <div className={styles.jsonObject}>
            <p><b>Headline:</b> <a href={item.url} target="_blank" rel="noopener noreferrer">{item.headline}</a></p>
            <p><b>Summary:</b> {item.summary}</p>
            <p><b>Date:</b> {new Date(item.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))
    )}
  </div>
);

export default NewsComponent;
