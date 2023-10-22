
import { useState, useEffect, useRef, useMemo } from 'react'
import VoiceElement from './VoiceElement';
import { base64ToArrayBuffer, createSummary } from '@/utils/utils';
import ReactMarkdown from "react-markdown"
import Paragraph from '@/utils/Renderers/ParagraphRenderer';
import Heading1 from '@/utils/Renderers/H1Renderer';
import List from '@/utils/Renderers/ListRenderer';
import ListElement from '@/utils/Renderers/ListElementRenderer';
import Heading2 from '@/utils/Renderers/H2Renderer';
import Heading3 from '@/utils/Renderers/H3Renderer';
import CodeRenderer from '@/utils/Renderers/CodeRenderer';
import Table from '@/utils/Renderers/TableRenderer';
import remarkGfm from 'remark-gfm';
import Tbody from '@/utils/Renderers/TableBody';



export default function Chat() {

    const [inputValue, setInputValue] = useState('')
    const [isloading, setIsloading] = useState(false)
    const [chatlog, setChatlog] = useState({messages: [], pending: undefined, history: []})
    const { messages, pending, history } = chatlog;
    const messageListRef = useRef(null)

    const [streamingText, setStreamingText] = useState("")


  

    const renderers = {
      table: Table,
      tableHead: Table,
      tableBody: Tbody,
      tableRow: Table,
      tableCell: Table,
    
      p: Paragraph,
      h1: Heading1,
      h2: Heading2,
      h3: Heading3,
      ul: List,
      ol: List,
      li: ListElement,
      inlineCode: CodeRenderer,
      code: CodeRenderer,
      
      
    }

   
    useEffect(() => {
        const messageList = messageListRef.current;
        if (messageList) {
          messageList.scrollTop = messageList.scrollHeight;
        }
      }, [messages, pending]);

      

      async function handleSubmit(e) {
      
        e.preventDefault()  

  
  
        
      
    
        setChatlog(prevChatlog => ({
          ...prevChatlog,
          messages: [...prevChatlog.messages, {type:"user", message: inputValue}],
          pending: undefined
        }))
        
        setInputValue('')
        setChatlog(prevChatlog => ({...prevChatlog, pending: ""}))
        
        setIsloading(true)
        await sendMessagesLang(inputValue)
        setIsloading(false)
      }
    


async function sendMessagesLang(message) {
        const sysMessage = "the text that you will generate will be read out loud and not be displayed on a screen. generate conversational text that can be clearly understood by just listening"
        //POST REQUEST
        const response = await fetch("/api/test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({message, sysMessage }),
        })

        // LLM VARIABLES
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        const fulltext = []
        
        // TTS VARIABLES
        const voiceId = "21m00Tcm4TlvDq8ikWAM";
        const format = "pcm_24000"
        const model = 'eleven_monolingual_v1';
        const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=${format}`;
        const socket = new WebSocket(wsUrl);

        // AUDIO VARIABLES
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
          
        socket.addEventListener('message', async (event) => {
          const response = await JSON.parse(event.data);

          if (response.audio) {

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

        })
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunkValue = decoder.decode(value);
          fulltext.push(chunkValue)
          setChatlog(prevChatlog => ({
            ...prevChatlog,
            pending: (prevChatlog.pending ?? "") + chunkValue,
          }));
          const textMessage = {
            "text": `${chunkValue}`,
            "try_trigger_generation": false,
          };
          socket.send(JSON.stringify(textMessage))
  
        }
        createSummary(message, setStreamingText)
        

        socket.onclose = function (event) {
          if (event.wasClean) {
            console.info(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
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
            return;
            
          }

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




    
  
    const chatMessages = useMemo(() => {
      return [...messages, ...(pending ? [{type:"bot", message: pending}] : [])]
    }, [messages, pending])



    async function handleTranscript(text) {
      
      setChatlog(prevChatlog => ({
        ...prevChatlog,
        messages: [...prevChatlog.messages, {type:"user", message: text}],
        pending: undefined
      }))

      setChatlog(prevChatlog => ({...prevChatlog, pending: ""}))
      setIsloading(true)
      sendMessagesLang(text)
      setIsloading(false)
    }
  
    return (
      <>



<div className='bg-gray-800 h-screen'>
  <div className='h-full mx-10 py-3 flex overflow-x-hidden justify-around'> 



    {/* Chat Container */}
    <div className='w-1/4'>
      <h1 className='bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center font-bold text-5xl pb-4'>V2.2</h1>
      <div className='flex flex-col h-4/6 bg-gray-900 my rounded-lg h-1/ overflow-y-scroll hide-scrollbar'>
        <div className='flex-grow p-6'>
          <div className='flex flex-col space-y-4'>
            {
              chatMessages.map((message, index) => {
                if (message.type === 'bot') {
                  return (
                    <div key={index} className='flex justify-start'>
                      <div className='bg-gray-800 rounded-lg p-4 text-white max-w-2xl break-words'>
                        {message.message}
                      </div>
                    </div>
                  );
                } else if (message.type === 'user') {
                  return (
                    <div key={index} className='flex justify-end'>
                      <div className='bg-purple-500 rounded-lg p-4 text-white max-w-2xl break-words'>
                        {message.message}
                      </div>
                    </div>
                  );
                }
                return null; 
              })
            }
          </div> 
        </div> 
      </div>

      <form onSubmit={handleSubmit} className='flex-none p-1'>
        <div className='flex rounded-lg border border-gray-700 bg gray-800'>
          <input type="text" className='flex-grow px-4 py-2 bg-transparent text-white focus:outline-none' placeholder={isloading? "waiting for response..." : 'Ask something'} value={inputValue} onChange={(e)=> setInputValue(e.target.value)} disabled={isloading} />
          <button disabled={isloading} type='submit' className='bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300'>Send</button>
        </div>
      </form>
      <VoiceElement onTranscript={handleTranscript}></VoiceElement>
      
    </div>

        {/* New Container */}
        <div className='w-2/3 bg-gray-900 rounded-lg overflow-y-scroll hide-scrollbar'>
        <ReactMarkdown className='mx-5' children={streamingText} components={renderers} remarkPlugins={[remarkGfm]}/>
        </div>
      </div>
</div>

      </>
    )
  }
  
  