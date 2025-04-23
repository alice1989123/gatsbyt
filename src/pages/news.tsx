import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import NewsComponent from '../app/components/newsComponent';
import styles from './news.module.css'; 
//import SentimentVisualizer from '../app/components/SentimentVisualizer';
import { NewsItem } from '../types/types';

const api = '/api/proxy'; 

const About = () => {


    
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  

  useEffect(() => {
    async function fetchNews() {
      try {
        const response_ = await fetch(api+"?resource=news", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then((response) => response.json())
        .then((data) => { 
          //console.log(data); 
          setNews(data.news); 
          setSentiment(data.sentiment); 
          setLoading(false);
        }); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchNews();
  }, []);

  return (
    
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.page }>
               
               <h1 className={styles.title}>Sentiment analysis</h1>
 
                         <div className={styles.container}>
                           {loading ? (
                             <p>Loading...</p>
                           ) : error ? (
                             <p>Error: {error.message}</p>
                           ) : (
                             <><NewsComponent news={news} /></>
                           )}
                         </div>
 
         </div>
        <Footer />
 
 
                       {/* <SentimentVisualizer /> */}


    </div>
  );
}

export default About;