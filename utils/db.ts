import { ChromaClient } from "chromadb";

const client = new ChromaClient();

client.heartbeat().then(console.log)

export default client
  