import path from 'path';
import fs, { WriteFileOptions } from 'fs';

class SystemHelper {
	private static self: SystemHelper;

	public static getInstance(): SystemHelper {
		if (!SystemHelper.self) {
			SystemHelper.self = new SystemHelper();
		}
		return SystemHelper.self;
	}

	public sleep(ms: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout((): void => {
				resolve();
			}, ms);
		});
	}

	public writeFileSync(content: unknown, filename: string, options?: WriteFileOptions): void {
		const directory = path.dirname(filename);
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, {
				recursive: true,
			});
		}
		let data: string;
		try {
			data = JSON.stringify(content, null, 4);
		} catch (e) {
			data = (content as NodeJS.ArrayBufferView).toString();
		}
		fs.writeFileSync(filename, data, options ?? 'utf-8');
	}
}

export const System = SystemHelper.getInstance();
