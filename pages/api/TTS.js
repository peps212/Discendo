import OpenAI from "openai";
const axios = require("axios")

client = OpenAI()

export default async function handler(req, res) {

    message = req.body
    
    const response = await axios.post('https://api.openai.com/v1/audio/speech', {
        model: "tts-1",
        voice: "alloy",
        input: text
      }, {
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json'
        }
    });

    const resp = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text,
    )



    

}