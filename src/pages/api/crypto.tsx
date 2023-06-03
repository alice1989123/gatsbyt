import React from 'react';
import Header from '@/app/Header';
import Footer from '@/app/Footer';
import { useState , useEffect } from 'react';
import { Coin } from "@/types/types";

const api = 'https://5ng8c5b4e2.execute-api.eu-central-1.amazonaws.com/default/cryptoNews'


const About = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true); 
  useEffect(() => {

    async function fetchPrices() {
      try {
        //const res = await fetchData();
         const response_ = await fetch( api + `?collection_name=${props.coin.symbol}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => response.json())
          .then((data) => { setNews(data.predictions)  ; setLoading(false)  }) 

      } catch (error) {
        console.error('Error fetching data:', error);
      }
     
    }
    fetchPrices();
  }, []);


    return (
        <div>
            <Header />

            <h1>About Us{JSON.stringify(news)+ "news" }</h1>
            <p>This is our story...</p>
            <Footer />

        </div>
    );
}

export default About;