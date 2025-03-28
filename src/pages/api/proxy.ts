import aws4 from 'aws4';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { collection_name } = req.query;

  if (!collection_name || typeof collection_name !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid collection_name' });
  }

  const  host = '19uc349uc1.execute-api.eu-central-1.amazonaws.com' ;
  let path: string;

  if (collection_name === 'news') {
    path = '/default/news';
  } else {
    path = `/default/predictions?collection_name=${collection_name}`;
  }

  const opts: aws4.Request = {
    host,
    path,
    method: 'GET',
    service: 'execute-api',
    region: 'eu-central-1',
    headers: {
      Host: host,
    },
  };

  aws4.sign(opts, {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
  });

  console.log('[DEBUG] Signed request options:', opts);

  const reqOptions = {
    hostname: host,
    path: path,
    method: opts.method,
    headers: opts.headers,
  };

  const proxyReq = https.request(reqOptions, (proxyRes) => {
    let data = '';

    proxyRes.on('data', (chunk) => {
      data += chunk;
    });

    proxyRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        res.status(proxyRes.statusCode || 200).json(json);
      } catch (error) {
        console.error('[ERROR] JSON parse failed:', error);
        console.error('[RAW RESPONSE]', data);
        res.status(500).json({ error: 'Invalid JSON response', raw: data });
      }
    });
  });

  proxyReq.on('error', (error) => {
    console.error('[ERROR] Request failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  });

  proxyReq.end();
}
