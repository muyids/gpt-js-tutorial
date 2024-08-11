import OpenAI from "openai";
import {getWeather} from './prep/weather.js'
const openai = new OpenAI({apiKey: process.env.OPEN_AI_KEY});

// ![](https://muyids.oss-cn-beijing.aliyuncs.com/img/Snipaste_2024-08-11_07-48-08.png)

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


let messages = [
    { role: "system", content: "You give very short answers." },
    // { role: "user", content: "Is it raining in Beijing?" }
    { role: "user", content: "Will flights in Beijing be delayed today due to the weather?" }
]
console.log('------------------- First Request -------------------');
console.log(messages);
const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    functions: [weatherFunctionSpec]
})

// console.log(response.choices[0].message);
let responseMessage = response.choices[0].message;
messages.push(responseMessage);
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
    console.log(`weatherData: ${weatherData}`);
    
    messages.push({ role: "function", name: "get_weather", content: JSON.stringify(weatherData) });
    console.log('------------------- Second Request -------------------');
    console.log(messages);
    const response2 = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        functions: [weatherFunctionSpec]
    })
    console.log('------------------- Second Response -------------------');
    console.log(response2.choices[0].message);

}