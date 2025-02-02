"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChunks = void 0;
const createChunks = (text, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
};
exports.createChunks = createChunks;
