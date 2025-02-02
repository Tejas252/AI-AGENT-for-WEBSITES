"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chromadb_1 = require("chromadb");
const client = new chromadb_1.ChromaClient();
client.heartbeat().then(console.log);
exports.default = client;
