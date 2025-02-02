import client from "../../utils/db";

export const websiteCollection = async () => {
    return await client.getOrCreateCollection({
        name: "website_embeddings",
    })
}


