import aws4 from 'aws4';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse ) {

  const { resource  , metric_name , coin} = req.query;

  let path: string;

  console.log("Query:", req.query);
  console.log("Resource:", resource);

  if (resource === 'news') {
    path = '/default/news';
  } 
  else if (resource === 'on_chain_metrics') {
    if (!metric_name || typeof metric_name !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid metric_name' });
    }

    const encodedMetric = encodeURIComponent(metric_name);
    path = `/default/on_chain_metrics?metric=${encodedMetric}`;
  } 
  else if (resource === 'predictions') {
    if (!coin || typeof coin !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid coin' });
    }

    const encodedCoin= encodeURIComponent(coin as string);
    path = `/default/predictions?coin=${encodedCoin}`;
    console.log(path)
  }
  else {
    return res.status(400).json({ error: 'Missing or invalid resource' });
  }


  const opts: aws4.Request = {
    host : process.env.CRYPTO_API!,
    path,
    method: 'GET',
    service: 'execute-api',
    region: 'eu-central-1',
    headers: {
      Host: process.env.CRYPTO_API!,
    },
  };

  aws4.sign(opts, {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
  });


  const reqOptions = {
    hostname: process.env.CRYPTO_API!,
    path: path,
    method: opts.method,
    headers: opts.headers,
  };

  //console.log( reqOptions)

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
