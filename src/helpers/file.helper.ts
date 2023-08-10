import * as fs from 'fs';
import * as path from 'path';

function writeSync(filename: string, content: unknown, directory = 'tpm'): void {
	const file = path.dirname(`./${directory}/${filename}`);
	if (!fs.existsSync(file)) {
		fs.mkdirSync(file, { recursive: true });
	}
	let data: string;
	try {
		data = JSON.stringify(content);
	} catch (e) {
		data = (content as object).toString();
	}
	fs.writeFileSync(file, data, 'utf-8');
}

export const FileHelper = {
	writeSync,
};
