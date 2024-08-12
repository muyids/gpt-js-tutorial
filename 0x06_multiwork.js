import OpenAI from "openai";
import { getWeather } from './prep/weather.js';
import { saveToFile } from './prep/utils.js';

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

const weatherFunctionSpec = {
    name: "get_weather",
    description: "Get the current weather in a location.",
    parameters: {
        type: "object",
        properties: {
            location: {
                type: "string",
                description: "The location to get the weather for."
            },
        },
        required: ["location"]
    },
    return_type: "string",
};

const saveFileFunctionSpec = {
    name: "save_file",
    description: "Save a file to the server.",
    parameters: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "The name of the file."
            },
            content: {
                type: "string",
                description: "The contents of the file."
            },
        },
        required: ["name", "content"]
    },
    return_type: "string",
};

async function callGpt(model, systemPrompt, userPrompt) {
    let messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ];

    let finishReason = null;
    let responseMessage = null;

    while (finishReason !== 'stop') {
        console.log('------------------- Request -------------------');
        console.log(messages);

        const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            functions: [weatherFunctionSpec, saveFileFunctionSpec]
        });

        responseMessage = response.choices[0].message;
        finishReason = response.choices[0].finish_reason;

        messages.push(responseMessage);

        if (responseMessage.function_call?.name === "get_weather") {
            const location = JSON.parse(responseMessage.function_call.arguments).location;
            console.log(`Gpt asked for the weather in ${location}.`);
            const weatherData = await getWeather(location);
            console.log(`weatherData: ${weatherData}`);

            messages.push({ role: "function", name: "get_weather", content: JSON.stringify(weatherData) });
        } else if (responseMessage.function_call?.name === "save_file") {
            const { name, content } = JSON.parse(responseMessage.function_call.arguments);
            console.log(`Gpt asked to save a file named ${name} with content: ${content}.`);
            // Save the file here
            await saveToFile(name, content);
            console.log('Saved file:', name);
        }
    }

    console.log('------------------- Final Response -------------------');
    console.log(responseMessage);
    return responseMessage;
}

// Example usage:
const finalMessage = await callGpt("gpt-4o-mini", "You give very short answers.", "what is the weather in Beijing now?");
// const finalMessage = await callGpt("gpt-4o-mini", "You give very short answers.", "Is the weather hotter in Beijing than Shanghai?");
// const finalMessage = await callGpt("gpt-4o-mini", "You give very short answers.", "Give me the weather in the 3 largest cities in China.");
// const finalMessage = await callGpt("gpt-4o", 
//     "You are a very good assistant. I need your help to save a file.",
//     "Make a file call song.txt with the lyrics of the weather in Beijing today.");
console.log('Final Message:', finalMessage);
