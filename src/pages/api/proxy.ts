// pages/api/proxy.ts

import aws4 from 'aws4';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.debug === 'creds') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.status(200).json({
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
      SESSION_TOKEN: process.env.SESSION_TOKEN
    });
  }
  const { collection_name } = req.query;

  if (!collection_name || typeof collection_name !== 'string') {
    return res.status(400).json({ error: "Missing or invalid collection_name" });
  }

  const host = 'e9sc2lfsg2.execute-api.eu-central-1.amazonaws.com';
  const path = `/default/predictionsApi?collection_name=${collection_name}`;
  const opts: aws4.Request = {
    host,
    path,
    method: 'GET',
    service: 'execute-api',
    region: 'eu-central-1',
    headers: {
      Host: host,
    }
  };

  try {
    aws4.sign(opts, {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN || undefined, // if using temporary creds
    });

    

    const request = https.request(opts, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        try {
          const json = JSON.parse(body);
          res.status(response.statusCode || 200).json(json);
        } catch (parseErr) {
          console.error('Failed to parse response:', parseErr);
          res.status(500).json({ error: 'Could not parse response', raw: body });
        }
      });
    });

   

    

    request.on('error', (err) => {
      console.error('Request error:', err);
      res.status(500).json({ error: err.message });
    });

    request.end();
  } catch (err: any) {
    console.error('Signing error:', err);
    res.status(500).json({ error: err.message });
  }
}
