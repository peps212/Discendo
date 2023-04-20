// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextResponse } from 'next/server';
import { stream } from '../utils/Streaming';
 
export const config = {
  runtime: 'edge',
};
 
const handler = async (req) => {
  const { message } = await req.json()


  

  return new NextResponse(await stream(message), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
};

export default handler;