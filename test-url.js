const url1 = "https://dcfed968183ebaab698849dac55d1847.r2.cloudflarestorage.com/geoforesight-assets/uploads/1773428229996-image_3.jpg";
const url2 = "https://pub-abcdef123.r2.dev/uploads/test-img.jpg";

const S3_BUCKET = "geoforesight-assets";
process.env.NEXT_PUBLIC_R2_URL = "https://pub-abcdef123.r2.dev";

function getKey(url) {
    let key = '';
    const parsedUrl = new URL(url);
    
    // 1. Cloudflare R2 path-style or S3-style
    if (url.includes('cloudflarestorage.com')) {
        // Path format: /<bucket>/<key>
        const bucketMatch = url.match(new RegExp(`/${S3_BUCKET}/(.+)`));
        if (bucketMatch) {
            key = bucketMatch[1];
        } else {
            key = parsedUrl.pathname.split('/').slice(2).join('/');
        }
    } 
    // 2. Cloudflare R2 Public URL (r2.dev or custom endpoint)
    else if (url.includes('.r2.dev') || process.env.NEXT_PUBLIC_R2_URL && url.startsWith(process.env.NEXT_PUBLIC_R2_URL)) {
        let baseUrl = '';
        if (process.env.NEXT_PUBLIC_R2_URL && url.startsWith(process.env.NEXT_PUBLIC_R2_URL)) {
                baseUrl = process.env.NEXT_PUBLIC_R2_URL;
        } else {
                baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
        }
        
        key = url.substring(baseUrl.length);
        if (key.startsWith('/')) {
            key = key.substring(1);
        }
    }
    
    return key;
}

console.log("URL 1 Extracted Key:", getKey(url1));
console.log("URL 2 Extracted Key:", getKey(url2));
