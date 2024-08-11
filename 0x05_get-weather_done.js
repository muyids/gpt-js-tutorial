import OpenAI from "openai";
import { getWeather } from './prep/weather.js';

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
            functions: [weatherFunctionSpec]
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
        }
    }

    console.log('------------------- Final Response -------------------');
    console.log(responseMessage);
    return responseMessage;
}

// Example usage:
// const finalMessage = await callGpt("gpt-4o-mini", "You give very short answers.", "Is the weather hotter in Beijing than Shanghai?");
const finalMessage = await callGpt("gpt-4o-mini", "You give very short answers.", "Give me the weather in the 3 largest cities in China.");

console.log('Final Message:', finalMessage);
