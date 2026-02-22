import fs from 'fs';
import path from 'path';
import { BlogPost, PostRequest } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface DbSchema {
    posts: BlogPost[];
    requests: PostRequest[];
}

export const readDb = (): DbSchema => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { posts: [], requests: [] };
    }
};

export const writeDb = (data: DbSchema) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};
