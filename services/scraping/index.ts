import axios from "axios";
import * as cheerio from "cheerio";
import { createChunks } from "../../utils";
import { websiteCollection } from "../chormadb";
import { createEmbedding } from "../gemini";

var visited: Set<string> = new Set();
const webCollection = websiteCollection();

export const scrape = async (url: string): Promise<{
    internalLinks?: string[];
    externalLinks?: string[];
} | void>  => {

    try {
        
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const head = $("head").html() || "";
        const body = $("body").html() || "";
        const internalLinks: Set<string> = new Set();
        const externalLinks: Set<string> = new Set();
    
        const links = $("a[href]")
            .map((_, el) => $(el).attr("href"))
            .get()
            .map((l) => {
                if (l?.startsWith("hhtps://")) {
                    internalLinks.add(l);
                } else {
                    externalLinks.add(l);
                }
            })

            for(const chunk of createChunks(head, 1000)) {      
                const result = await createEmbedding(chunk);
                (await webCollection).add({
                    ids: url,
                    embeddings: result,
                    documents: chunk,
                    metadatas:{
                        type:"head"
                    }
                })
            }

            for(const chunk of createChunks(body, 1000)) {      
                const result = await createEmbedding(chunk);
                (await webCollection).add({
                    ids: url,
                    embeddings: result,
                    documents: chunk,
                    metadatas:{
                        type:"body"
                    }
                })
            }

            console.log("Scraped:", url);
    
        return {
            internalLinks: Array.from(internalLinks).filter(link => link !== undefined),
            externalLinks: Array.from(externalLinks).filter(link => link !== undefined)
        }

    } catch (error:any) {
        console.error(`${url}: ERROR: ${error}`);
    }
};

export const scrapeRecusively: (baseUrl:string,url: string) => Promise<void> = async (baseUrl:string,url: string): Promise<void> => {
    if(visited.has(url)) {
        return
    }
    visited.add(url);
    const data = await scrape(baseUrl+url);

    if (data?.internalLinks) {
        for (const link of data.internalLinks) {
            await scrapeRecusively(baseUrl,link);
        }
    }

    return;
};  

