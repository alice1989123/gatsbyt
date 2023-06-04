import React, { useState, useEffect } from 'react';
import Header from '@/app/Header';
import Footer from '@/app/Footer';
import NewsComponent from '../app/components/newsComponent';
import styles from './news.module.css'; // import your styles
import SentimentVisualizer from '../app/components/SentimentVisualizer';


const api = 'https://5ng8c5b4e2.execute-api.eu-central-1.amazonaws.com/default/cryptoNews'

const About = () => {

type NewsItem = {
        summary: string;
        source: string;
        sentiment: string;
        entities: string;
        tweets_number: number;
      };
    
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response_ = await fetch(api, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then((response) => response.json())
        .then((data) => { 
          console.log(data); 
          setNews(data.news.news); 
          setSentiment(data.sentiment); 
          setLoading(false);
        }); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchPrices();
  }, []);

  return (
    
    <div >
            <Header />
              <div className={styles.page}>
                
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
