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
    headline: string;
    summary: string;
    url: string;
    date: string;
  }
