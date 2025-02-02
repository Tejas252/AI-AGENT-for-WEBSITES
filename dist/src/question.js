"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const gemini_1 = require("../services/gemini");
const openai_1 = __importDefault(require("openai"));
const chormadb_1 = require("../services/chormadb");
const openai = new openai_1.default({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
dotenv_1.default.config();
// scrapeRecusively("https://piyushgarg.dev","/").then((data) => {
//     console.log("done");
// })
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const webCollection = yield (0, chormadb_1.websiteCollection)();
        const question = 'who is piyush garg';
        const model = gemini_1.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resultEmbedding = yield (0, gemini_1.createEmbedding)(question);
        // @ts-ignore
        const colResult = yield webCollection.query({
            queryEmbeddings: resultEmbedding,
            nResults: 2,
        });
        const body = colResult.documents;
        console.log("🚀 ~ main ~ body:", body);
        const url = colResult.ids;
        console.log("🚀 ~ main ~ url:", url);
        const response = yield openai.chat.completions.create({
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
    });
}
main();
