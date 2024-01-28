import { useWhisper } from '@chengsokdara/use-whisper'
import { useEffect, useState } from 'react';
import {usePorcupine} from "@picovoice/porcupine-react";

import heyJarvisKeywordModel from "/src/hey_leo"
import modelParams from "/src/porcupine_params";

export default function VoiceElement({onTranscript}) {


  const { transcript, startRecording } = useWhisper({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_TOKEN, // YOUR_OPEN_AI_TOKEN
    nonStop: true, // keep recording as long as the user is speaking
    stopTimeout: 2000, // auto stop after 5 seconds
  })

    useEffect(() => {
        if (transcript.text) {
          onTranscript(transcript.text);
        }
      }, [transcript.text]);



        const [keywordDetections, setKeywordDetections] = useState([]);
      
        const {
          keywordDetection,
          isLoaded,
          isListening,
          error,
          init,
          start,
          stop,
          release
        } = usePorcupine();
      
        const initEngine = async () => {
          await init(
            process.env.NEXT_PUBLIC_HOTWORD,
            {
              "base64": heyJarvisKeywordModel,
              "label": "Hey leo"
            },
            {base64: modelParams}
          );
          start()
        }
      
        useEffect(() => {
          if (keywordDetection !== null) {
            setKeywordDetections((oldVal) =>
              [...oldVal, keywordDetection.label])
              console.log("HEY PEPPE")
              startRecording()
          }
        }, [keywordDetection])
      


  return (
    <div>
      <button className='bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300' onClick={() => initEngine()}>Talk</button>
    </div>
  )





}