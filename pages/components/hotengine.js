import {useEffect, useState} from "react";

import {usePorcupine} from "@picovoice/porcupine-react";

import heyJarvisKeywordModel from "/src/hey_leo"
import modelParams from "/src/porcupine_params";

export default function VoiceWidget() {
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
    }
  }, [keywordDetection])

  return (
    <div className="voice-widget">
      <h3>
        <label>
          <button
            className="init-button"
            onClick={() => initEngine()}
          >
            Start
          </button>
        </label>
      </h3>
      {keywordDetections.length > 0 && (
        <ul>
          {keywordDetections.map((label, index) => (
            <li key={index}>{label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}