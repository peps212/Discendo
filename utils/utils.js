export function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    return bytes.buffer;
  }



  export async function createSummary(message) {
           const sysMessage = "given the following text, summarize what has been said as if you were to display it on a screen to highlight the key concepts."
            //POST REQUEST
            const response = await fetch("/api/test", {
              method: "POST",
              headers: {
                "Content-Type": "application/json" 
              },
              body: JSON.stringify({message, sysMessage}),
            })

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;


            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              const chunkValue = decoder.decode(value);


              console.log(chunkValue)
            }

  }