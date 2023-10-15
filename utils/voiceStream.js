const voice = require("elevenlabs-node")
const fs = require("fs-extra")

const apiKey = "43ae26a3b25fd0392bf567a51ca82db0"
const voiceID = "pNInz6obpgDQGcFmaJgB"
const fileName = "audio.mp3"; // The name of your audio file
const textInput = "this is a test"; // The text you wish to convert to speech

export default function voiceGen() {
    voice.textToSpeechStream(apiKey, voiceID, textInput).then((res) => {
    res.pipe(fs.createWriteStream(fileName));
    });
}