import { promises as fs } from 'fs';

export async function saveToFile(filePath, data) {
    try {
        await fs.writeFile(filePath, data);
        console.log('File saved successfully!');
    } catch (err) {
        console.error('Error saving file:', err);
    }
}
