export function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    return bytes.buffer;
  }



  export async function createSummary(message, updateTextCallback) {
           const sysMessage = "answer this question creating 'study notes' for the student, summarise the core concepts and give a clear explanaition. Enrich your text with headings, tables, lists and make it easibly readable and digestible. RETURN YOUR TEXT IN MARKDOWN."
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
            let aggregatedText = ""


            while (!done) {
              const { value, done: readerDone } = await reader.read();
              done = readerDone;
              const chunkValue = decoder.decode(value);

              aggregatedText += chunkValue
              updateTextCallback(aggregatedText)

            }

  }