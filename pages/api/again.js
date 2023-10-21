import { WebSocket as WebSocketNode } from 'ws';

function connectElevenLabs(tokens) {
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Replace with your voice_id
    const model = 'eleven_monolingual_v1';
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;
    const elevenSocket = new WebSocketNode(wsUrl);
  
    // Initialize connection to Eleven Labs by sending BOS message
    elevenSocket.onopen = function (event) {
        const bosMessage = {
            "text": " ",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": true
            },
            "xi_api_key": ELEVEN_LABS_KEY
        };
 
        elevenSocket.send(JSON.stringify(bosMessage));
        
        const textMessage = {
            "text": `${message}`,
            "try_trigger_generation": true,
          };
    
        socket.send(JSON.stringify(textMessage));

        const eosMessage = {
            "text": ""
          };
      
          socket.send(JSON.stringify(eosMessage));
        
    }
 
    // Decode and send  audio chunks from Eleven Labs to frontend
    elevenSocket.onmessage = function (event) {
        const response = JSON.parse(event.data);
 
        console.log("Receiving audio from Eleven Labs");
 
        if (response.audio) {
            const audioChunk = atob(response.audio);
            res.write(audioChunk)
        }
    };
 
    elevenSocket.onerror = function (error) {
        console.error(`Eleven Labs WebSocket Error: ${error}`);
    };
 
    elevenSocket.onclose = function (event) {
        console.info(`Even Labs Connection closed`);
    };
}

export default async function handler (req,res) {
    const message = req.body.token

    elevenSocket(message)

    

}