export interface PriceData {
    date: string;
    price: number;
  }

  export interface Coin{
    name: string;
    symbol: string;
    coinpng: string;
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

  export interface PredictionMetadata {
    symbol: string;
    model_name: string;
    val_loss: number;
    mae: number;
    input_width?: number;
    label_width?: number;
    variables_used?: string[];

  }
