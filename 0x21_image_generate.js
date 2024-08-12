import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: "a white siamese cat",
  n: 1,
  size: "1024x1024",
});

let image_url = response.data[0].url;

console.log(image_url);