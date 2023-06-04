import React from 'react';
import Head from 'next/head'; // Import Head component from Next.js
import { FC } from 'react';
/* import WordCloud from 'react-wordcloud';
 */import styles from './NewsComponent.module.css'; // Import CSS module





type NewsComponentProps = {
  news: NewsItem[];
};

type NewsItem = {
  summary: string;
  source: string;
  sentiment: string;
  entities: string;
  tweets_number: number;
};

const NewsComponent: FC<NewsComponentProps> = ({ news }) => (
  <div className={styles.page}>
    <Head>
      <title>Crypto News Dashboard</title> {/* Updated title */}
    </Head>

    <h1 className={styles.title}>Crypto News Dashboard</h1>

    <div className={styles.container}>
      {news.map((item, index) => (
        <div key={index} className={styles.newsItem}>
          {/* <div className={styles.wordCloud}>
           <WordCloud 
              options={{
                colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'], // array of colors
                fontFamily: 'arial',
                fontSizes: [10, 60],
              }}
              words={item.entities === 'No entities.' ? 
                item.summary.split(' ').map(word => ({ text: word, value: 50 })) :
                item.entities.split(', ').map(entity => ({ text: entity, value: 50 }))
              }
            /> 
          </div> */}
          <div className={styles.jsonObject}>
            <p><b>Summary:</b> {item.summary}</p>
            <p><b>Source:</b> {item.source}</p>
            <p className={styles.sentiment}><b>Sentiment:</b> {item.sentiment}</p>
            <p><b>Tweets Analyzed:</b> {item.tweets_number}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default NewsComponent;
