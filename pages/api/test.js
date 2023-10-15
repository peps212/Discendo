// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { OpenAI, Configuration } from "openai";



const openai = new OpenAI({apiKey: process.env.OPENAI_API_TOKEN});

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const message = req.body.message;
  console.log(message)

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const result = completion.choices[0].message.content;
    console.log(result)

    return res.status(200).json({ result });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "OpenAI API request failed" });
  }
};
