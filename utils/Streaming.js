import { base64ToArrayBuffer } from "./utils";

export async function sendMessagesLang(message) {

    //POST REQUEST
    const response = await fetch("/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({message }),
    })

    // VARIABLES
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    
    const voiceId = "21m00Tcm4TlvDq8ikWAM";
    const format = "pcm_24000"
    const model = 'eleven_monolingual_v1';
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=${format}`;
    const socket = new WebSocket(wsUrl);

    const audioContext = new AudioContext();
    let audioQueue = [];
    let lastBufferSource = null;
    



    // SOCKET OPEN 
    socket.addEventListener('open', () => {
      const bosMessage = {
        "text": " ",
        "voice_settings": {
          "stability": 0.5,
          "similarity_boost": true
        }, 
         "generation_config": {
          "chunk_length_schedule": [100, 150, 250, 290]
        },
        "xi_api_key": `${process.env.NEXT_PUBLIC_EL_API_KEY}`
      };
      socket.send(JSON.stringify(bosMessage));
    })
      
    while (socket.readyState !== WebSocket.OPEN) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
      //LOOP


        socket.addEventListener('message', async (event) => {
          const response = await JSON.parse(event.data);
          console.log("RECEIVEDDDDDDDDDDDDDDDD")
          if (response.audio) {
            console.log("Received chunk");

            const audioData = base64ToArrayBuffer(response.audio); // Convert Base64 to ArrayBuffer
            const int16Array = new Int16Array(audioData);
            const samples = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
              samples[i] = int16Array[i] / 32767.0;
            }


            const audioBuffer = audioContext.createBuffer(1, samples.length, 24000);
            audioBuffer.getChannelData(0).set(samples);
        
            audioQueue.push(audioBuffer);
        
            // If nothing is currently playing, start playback.
            if (!lastBufferSource) {
              playNextChunk();
            }
          }
            else {
            console.log("No audio data in the response");
        }


      
        if (response.isFinal) {
            console.log("done")
          }
      
        if (response.normalizedAlignment) {
            console.log(response.normalizedAlignment)
        }

        })
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunkValue = decoder.decode(value);
          setChatlog(prevChatlog => ({
            ...prevChatlog,
            pending: (prevChatlog.pending ?? "") + chunkValue,
          }));
          const textMessage = {
            "text": `${chunkValue}`,
            "try_trigger_generation": false,
          };
          

          
          console.log("SEEEEEEEEEEEEENT")
          socket.send(JSON.stringify(textMessage))
  
        }


      socket.onclose = function (event) {
        if (event.wasClean) {
          console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
          console.log(event.reason)
        } else {
          console.warn('Connection died');
        }
      };
    
        setChatlog(prevChatlog => ({
          history: [...prevChatlog.history, [message, prevChatlog.pending ?? ""]],
          messages: [...prevChatlog.messages, {type:"bot", message: prevChatlog.pending ?? ""}],
          pending: undefined
        }))

        function playNextChunk() {
          if (audioQueue.length === 0) {
            lastBufferSource = null;
            console.log("BUFFER NULLLL")
            return;
            
          }
          
          console.log("Playing chunk");
          const nextBuffer = audioQueue.shift();
          const bufferSource = audioContext.createBufferSource();
          bufferSource.buffer = nextBuffer;
          bufferSource.connect(audioContext.destination);
          bufferSource.start();
        
          // The onended event should be on the bufferSource
          bufferSource.onended = () => {
            playNextChunk();
          };
        
          lastBufferSource = bufferSource;
        }
  }