import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What’s in this image?" },
          {
            type: "image_url",
            image_url: {
              "url": "https://muyids.oss-cn-beijing.aliyuncs.com/img/'Bear%20Silhouette'%20Poster,%20picture,%20metal%20print,%20paint%20by%20DecoyDesign%20_%20Displate.jpeg",
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
}
main();