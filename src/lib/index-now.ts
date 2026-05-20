import { SITE_URL } from "./constants";

const INDEX_NOW_KEY = (process.env.INDEX_NOW_KEY || "").trim();
const NORMALIZED_SITE_URL = SITE_URL.replace(/\/$/, "");
const INDEX_NOW_KEY_LOCATION = `${NORMALIZED_SITE_URL}/${INDEX_NOW_KEY}.txt`;

export async function submitToIndexNow(url: string) {
    if (!INDEX_NOW_KEY) {
        console.warn("IndexNow: Skipping submission (No INDEX_NOW_KEY)");
        return;
    }

    const host = new URL(NORMALIZED_SITE_URL).host;
    const body = {
        host: host,
        key: INDEX_NOW_KEY,
        keyLocation: INDEX_NOW_KEY_LOCATION,
        urlList: [url]
    };

    console.log(`IndexNow: Submitting ${url} to search engines...`);

    try {
        const response = await fetch("https://api.indexnow.org/IndexNow", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            console.log(`IndexNow: Successfully submitted ${url}`);
        } else {
            const errorText = await response.text();
            console.error(`IndexNow: Failed to submit ${url} (HTTP ${response.status}):`, errorText);
        }
    } catch (error) {
        console.error(`IndexNow: Error submitting ${url}:`, error);
    }
}
