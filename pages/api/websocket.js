import { normalizeConfig } from 'next/dist/server/config';
import { NextResponse } from 'next/server';
import { WebSocket as WebSocketNode } from 'ws';



export default async function handler(req, res) {

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");


  const message = req.body.token
  console.log(message)

  const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Replace with your voice_id
  const model = 'eleven_monolingual_v1';
  const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;
  const socket = new WebSocketNode(wsUrl);

  socket.onopen = function (event) {
    const bosMessage = {
      "text": " ",
      "voice_settings": {
        "stability": 0.5,
        "similarity_boost": true
      },
      "xi_api_key": "43ae26a3b25fd0392bf567a51ca82db0", // Replace with your API key
    };

    socket.send(JSON.stringify(bosMessage));

    const textMessage = {
      "text": `${message}`,
      "try_trigger_generation": true,
    };

    socket.send(JSON.stringify(textMessage));

    const eosMessage = {
      "text": ""
    };

    socket.send(JSON.stringify(eosMessage));
  };

  socket.onmessage = function (event) {
    const response = JSON.parse(event.data);

    if (response.audio) {
      const audioChunk = atob(response.audio);

      res.write(audioChunk);
    } else {
      console.log("No audio data in the response");
  }

  if (response.isFinal) {
      console.log("done")
  }

  if (response.normalizedAlignment) {
      console.log(response.normalizedAlignment)
  }
};


  socket.onerror = function (error) {
    res.status(500).json({ error: `WebSocket Error: ${error}` });
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
      console.warn('Connection died');
    }
  };
}
