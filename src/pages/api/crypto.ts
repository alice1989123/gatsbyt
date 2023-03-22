// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'



const ACCESS_TOKEN = 'your-access-token';

export default async function handler(req: NextApiRequest,
  res: NextApiResponse) {
  const response = await fetch("https://api.cryptoquant.com/v1/btc/market-indicator/mvrv?window=day&from=20191001&limit=2" , {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`
    }
  });
  const data = await response.json();
  res.status(200).json(data);
}