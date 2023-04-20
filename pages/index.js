import { useState, useEffect, useRef, useMemo } from 'react'
import TypingAnimation from './components/TypingAnimation'


export default function Home() {
  const [inputValue, setInputValue] = useState('')
  const [isloading, setIsloading] = useState(false)

  const [chatlog, setChatlog] = useState({messages: [], pending: undefined, history: []})
  

  const { messages, pending, history } = chatlog;
  



  async function sendMessagesLang(message) {
    console.log(message)

    const response = await fetch("/api/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({message }),
    })
    console.log(response.body)
    const data = response.body;
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;



    
    while (!done) {
      const {value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunkvalue = decoder.decode(value);
      console.log(chunkvalue);
      if (chunkvalue === "[DONE]") {
        setChatlog(prevChatlog => ({
          history: [...prevChatlog.history, [message, prevChatlog.pending ?? ""]],
          messages: [...prevChatlog.messages, {type:"bot", message: prevChatlog.pending ?? ""}],
          pending: undefined
        }))
      } else { 
        setChatlog(prevChatlog => ({
          ...prevChatlog,
          pending: (prevChatlog.pending ?? "") + chunkvalue
        }))
      }
      
    }

    setIsloading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()    

    setChatlog(prevChatlog => ({
      ...prevChatlog,
      messages: [...prevChatlog.messages, {type:"user", message: inputValue}],
      pending: ""
    }))
    setIsloading(true)
    sendMessagesLang(inputValue)

    setInputValue('')
  }

  

  const chatMessages = useMemo(() => {
    return [...messages, ...(pending ? [{type:"bot", message: pending}] : [])]
  }, [messages, pending])

  return (
    <>
    <div className='bg-gray-800 h-screen'>
    <div className='container mx-auto h-full w-5/6 py-3'>
    <h1 className='bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center font-bold text-5xl pb-4'>V2.2</h1>
      <div className='flex flex-col h-4/6 bg-gray-900 my rounded-lg h-1/ overflow-y-scroll'>
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
      {
        isloading && 
        <div key={chatlog.length} className='flex justify-start'>
          <div className='bg-gray-800 rounded-lg p-4 text-white max-w-2xl'>
            <TypingAnimation />
          </div>
        </div>
      }

            </div> 
          </div> 

          </div>
      <form onSubmit={handleSubmit} className='flex-none p-1 '>
        <div className='flex rounded-lg border border-gray-700 bg gray-800'>
        <input type="text" className='flex-grow px-4 py-2 bg-transparent text-white focus:outline-none' placeholder='Ask something' value={inputValue} onChange={(e)=> setInputValue(e.target.value)} />
        <button type='submit' className='bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300'>Send</button>
        </div>
      </form>
    </div>
    </div>
    </>
  )
}

