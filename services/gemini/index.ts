import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

type EmbeddingResult = {
    embedding: {
        values: number[];
    };
};
console.log("🚀 ~ process.env.GEMINI_API_KEY:", process.env.GEMINI_API_KEY)

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export const createEmbedding = async (text: string): Promise<number[]> => {
    const result: EmbeddingResult = await model.embedContent(text);
    console.log(result.embedding.values);
    return result.embedding.values;
};
