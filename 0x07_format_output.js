import OpenAI from "openai";
import { getWeather } from './prep/weather.js';
import { saveToFile } from './prep/utils.js';

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

const setLanguageFunctionSpec = {
    name: "set_language",
    description: "Set the main language spoken in a number of cities.",
    parameters: {
        type: "object",
        properties: {
            cities: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        city: {
                            type: "string",
                            description: "The name of the city."
                        },
                        language: {
                            type: "string",
                            description: "The main language spoken in the city."
                        }
                    },
                    required: ["city", "language"]
                }
            },
            
        },
        required: ["cities"]
    }
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
            functions: [setLanguageFunctionSpec],
            function_call: { name: 'set_language' }
        });

        responseMessage = response.choices[0].message;
        finishReason = response.choices[0].finish_reason;

       

        if (responseMessage.function_call?.name !== "set_language") {
            throw new Error('Unexpected function call:', responseMessage.function_call);
        }

        return JSON.parse(responseMessage.function_call.arguments);
    }

}

// Example usage:
const finalMessage = await callGpt("gpt-4o-mini", 
    "You give very short answers.",
    "What is the main language spoken in the three largest cities in Europe?"
);
console.log('Final Message:', finalMessage);
