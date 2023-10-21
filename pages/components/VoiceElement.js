import { useWhisper } from '@chengsokdara/use-whisper'
import { useEffect } from 'react';

export default function VoiceElement({disabled, onTranscript}) {


  const { transcript, startRecording } = useWhisper({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_TOKEN, // YOUR_OPEN_AI_TOKEN
    nonStop: true, // keep recording as long as the user is speaking
    stopTimeout: 2000,
    whisperConfig: {
        language: 'en',
      }, // auto stop after 5 seconds
    })

    useEffect(() => {
        if (transcript.text) {
          onTranscript(transcript.text);
        }
      }, [transcript.text]);
    


  return (
    <div>
      <button disabled={disabled} className='bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300' onClick={() => startRecording()}>Talk</button>
    </div>
  )
}