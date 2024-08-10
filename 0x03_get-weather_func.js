import OpenAI from "openai";
// import {getWeather} from './prep/weather.js'
const openai = new OpenAI({apiKey: process.env.OPEN_AI_KEY});

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
}

const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        { role: "system", content: "You give very short answers." },
        { role: "user", content: "Is it raining in Beijing?" }
    ],
    functions: [weatherFunctionSpec]
})

// console.log(response.choices[0].message);
let responseMessage = response.choices[0].message;
// responseMessage: 
// {
//     role: 'assistant',
//     content: null,
//     function_call: { name: 'get_weather', arguments: '{"location":"Beijing"}' },
//     refusal: null
// }
if (responseMessage.function_call?.name === "get_weather") {
    const location = JSON.parse(responseMessage.function_call.arguments).location;
    console.log(`Gpt asked for the weather in ${location}.`);
    const weatherData = await getWeather(location);
    console.log(weatherData);
}