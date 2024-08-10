import OpenAI from "openai";
const openai = new OpenAI({apiKey: process.env.OPEN_AI_KEY});

const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        { role: "system", content: "You give very short answers." },
        { role: "user", content: "Is it raining in Beijing?" }
    ],
})

console.log(response.choices[0].message.content);
