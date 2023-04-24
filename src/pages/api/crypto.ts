// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// api/crypto.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await fetchData(); // Call the function to fetch data
    res.status(200).json(data); // Send the data as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
}

async function fetchData() {
  const api = "https://u8x2fk7itj.execute-api.eu-central-1.amazonaws.com/default/crypto_forecast";
  const response = await fetch(api + "/predict", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export { fetchData };