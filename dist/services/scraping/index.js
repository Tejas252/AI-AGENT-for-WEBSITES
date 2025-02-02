"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.scrapeRecusively = exports.scrape = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const utils_1 = require("../../utils");
const chormadb_1 = require("../chormadb");
const gemini_1 = require("../gemini");
var visited = new Set();
const webCollection = (0, chormadb_1.websiteCollection)();
const scrape = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(url);
        const $ = cheerio.load(data);
        const head = $("head").html() || "";
        const body = $("body").html() || "";
        const internalLinks = new Set();
        const externalLinks = new Set();
        const links = $("a[href]")
            .map((_, el) => $(el).attr("href"))
            .get()
            .map((l) => {
            if (l === null || l === void 0 ? void 0 : l.startsWith("hhtps://")) {
                internalLinks.add(l);
            }
            else {
                externalLinks.add(l);
            }
        });
        for (const chunk of (0, utils_1.createChunks)(head, 1000)) {
            const result = yield (0, gemini_1.createEmbedding)(chunk);
            (yield webCollection).add({
                ids: url,
                embeddings: result,
                documents: chunk,
                metadatas: {
                    type: "head"
                }
            });
        }
        for (const chunk of (0, utils_1.createChunks)(body, 1000)) {
            const result = yield (0, gemini_1.createEmbedding)(chunk);
            (yield webCollection).add({
                ids: url,
                embeddings: result,
                documents: chunk,
                metadatas: {
                    type: "body"
                }
            });
        }
        console.log("Scraped:", url);
        return {
            internalLinks: Array.from(internalLinks).filter(link => link !== undefined),
            externalLinks: Array.from(externalLinks).filter(link => link !== undefined)
        };
    }
    catch (error) {
        console.error(`${url}: ERROR: ${error}`);
    }
});
exports.scrape = scrape;
const scrapeRecusively = (baseUrl, url) => __awaiter(void 0, void 0, void 0, function* () {
    if (visited.has(url)) {
        return;
    }
    visited.add(url);
    const data = yield (0, exports.scrape)(baseUrl + url);
    if (data === null || data === void 0 ? void 0 : data.internalLinks) {
        for (const link of data.internalLinks) {
            yield (0, exports.scrapeRecusively)(baseUrl, link);
        }
    }
    return;
});
exports.scrapeRecusively = scrapeRecusively;
