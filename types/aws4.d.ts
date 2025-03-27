declare module 'aws4' {
    export interface Request {
      host: string;
      path: string;
      method: string;
      service: string;
      region: string;
      headers?: Record<string, string>;
      body?: any;
    }
  
    export function sign(
      request: Request,
      credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
      }
    ): Request;
  }
  