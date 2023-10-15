// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextResponse } from "next/server";
import { OpenAI, Configuration } from "openai";

export const config = {
  runtime: 'edge',
};

const openai = new OpenAI({apiKey: process.env.OPENAI_API_TOKEN});


 

export default async (req, res) => {


  const {message} = await req.json();
  console.log("message"+message)

  if (!message) {
    return new Response('No message in the request', { status: 400 })
  }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      stream: true
    });


    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
  
        for await (const part of completion) {
          const text = part.choices[0]?.delta.content ?? ''
          const chunk = encoder.encode(text)
          controller.enqueue(chunk)
        }
        controller.close()
      },
    })
  

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }
