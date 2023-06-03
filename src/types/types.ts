export interface PriceData {
    date: string;
    price: number;
  }

  export interface Coin{
    name: string;
    symbol: string;
  }

  export interface News{
    name: string;
    symbol: string;
  }

  export type NewsItem = {
    summary: string;
    source: string;
    sentiment: string;
    entities: string;
    tweets_number: number;
  };

