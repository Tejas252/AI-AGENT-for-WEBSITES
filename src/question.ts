import dotenv from 'dotenv'
import { scrapeRecusively } from '../services/scraping';
import { createEmbedding, genAI } from '../services/gemini';
import OpenAI from "openai";
import { websiteCollection } from '../services/chormadb';

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


dotenv.config();

// scrapeRecusively("https://piyushgarg.dev","/").then((data) => {
//     console.log("done");
// })

async function main() {

    const webCollection = await websiteCollection()


    const question = 'who is piyush garg'

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const resultEmbedding = await createEmbedding(question);

    // @ts-ignore
    const colResult = await webCollection.query({
        queryEmbeddings: resultEmbedding,
        nResults: 2,
    })

    const body = colResult.documents
    console.log("🚀 ~ main ~ body:", body)
    const url = colResult.ids
    console.log("🚀 ~ main ~ url:", url)

    const response = await openai.chat.completions.create({
        model: "gemini-1.5-flash",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
                role: "user",
                content: `
                Query: ${question}
                URL:${url}
                Retrived Body:${body}
                `,
            },
        ],
    });

    console.log(response.choices[0].message);

}

main()




