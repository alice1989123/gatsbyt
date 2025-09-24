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
    config_label_width?: number;
    config_input_width?: number;
    config_variables_used?: string[];
    history?: string | History; 

  }
