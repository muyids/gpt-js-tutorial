import OpenAI from "openai";
import {getWeather} from './prep/weather.js'
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

const ticketFunctionSpec = {
    name: "ticket",
    description: "Get ticket information for a flight.",
    parameters: {
        type: "object",
        properties: {
            from: {
                type: "string",
                description: "The departure location."
            },
            to: {
                type: "string",
                description: "The destination location."
            },
            date: {
                type: "string",
                description: "The date of the flight."
            },
        },
        required: ["from", "to", "date"]
    },
    return_type: "string",
}

let messages = [
    { role: "system", content: "You give very short answers." },
    // { role: "user", content: "Is it raining in Beijing?" }
    { role: "user", content: "Please book a flight for me from Beijing to Shanghai." }
]
console.log('------------------- First Request -------------------');
console.log(messages);
const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    functions: [weatherFunctionSpec, ticketFunctionSpec]
})

console.log('------------------- First Response -------------------');
console.log(response.choices[0].message);
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

    // 增加订票功能
    responseMessage = response2.choices[0].message;
    messages.push(responseMessage);
}


if (responseMessage.function_call?.name === "ticket") {
    const {from, to, date} = JSON.parse(responseMessage.function_call.arguments);
    console.log(`Gpt asked for the ticket from ${from} to ${to} on ${date}.`);
    const ticketData = await order_ticket(from, to, date);
    
    messages.push({ role: "function", name: "ticket", content: JSON.stringify(ticketData) });
    console.log('------------------- Third Request -------------------');
    console.log(messages);
    const response3 = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        functions: [ticketFunctionSpec]
    })
    console.log('------------------- Third Response -------------------');
    console.log(response3.choices[0].message);
}