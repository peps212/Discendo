import { LLMChain } from "langchain/chains";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { AgentExecutor, ZeroShotAgent, initializeAgentExecutor } from "langchain/agents";
import { SerpAPI } from "langchain/tools";

import { CallbackManager } from "langchain/callbacks";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";

const KEY = process.env.KEY
const serpKEY = process.env.SERPKEY;


export async function stream(payload) {

    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()



    const model = new ChatOpenAI({
       openAIApiKey: KEY, 
       temperature: 0,
       streaming: true,
       callbackManager: CallbackManager.fromHandlers({
         handleLLMNewToken: async (token) => {
            console.log(token)
            await writer.ready;
            await writer.write(encoder.encode(`${token}`));
            },
        handleLLMEnd: async () => {
            await writer.ready;
            await writer.write(encoder.encode(`[DONE]`));
            await writer.close();
            },
      })
      },{basePath: "https://oai.hconeai.com/v1"});

    // _____ TOOLS ______

    const tools = [new SerpAPI(serpKEY)];
    const serpapi = tools[0]
    serpapi.description = "never use this tool"
    console.log(serpapi.description)

    //___________________
    const template =" you are an AI assistante that helps customers of the airline company called etihad. your role is to help the customer with whatever question they might have "

    
    const prompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(template),
        HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);
    
    //______CHAIN________
    const chain = new LLMChain({
        prompt: prompt,
        llm: model,
});


    const response = chain.call({ text: payload });





    //______AGENT________
    /*
    const executor = await initializeAgentExecutor(
      tools,
      model,
      "chat-conversational-react-description",
      true
    );
    executor.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
    });
    const response = executor.call({ input: payload });
    */


  return stream.readable;
    
};

