import path from 'path';
import fs, { WriteFileOptions } from 'fs';

class SystemSingleton {
  private static self: SystemSingleton;

  public static getInstance(): SystemSingleton {
    if (!SystemSingleton.self) {
      SystemSingleton.self = new SystemSingleton();
    }
    return SystemSingleton.self;
  }

  public sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout((): void => {
        resolve();
      }, ms);
    });
  }

  public scanDirectorySync(directory: string, filter?: RegExp): string[] {
    const result = [];
    if (!fs.existsSync(directory)) {
      return [];
    }
    const files = fs.readdirSync(directory);
    for (let i = 0; i < files.length; i++) {
      const filename = path.join(directory, files[i]);
      if (fs.lstatSync(filename).isDirectory()) {
        result.push(...this.scanDirectorySync(filename, filter));
        // } else if (filename.endsWith(filter)) {
      } else {
        if (!filter) {
          result.push(filename);
        } else if (filter.test(filename)) {
          result.push(filename);
        }
      }
    }
    return result;
  }

  public writeFileSync(filename: string, content: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): void {
    const directory = path.dirname(filename);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }
    // let data: string;
    // try {
    // 	data = JSON.stringify(content, null, 4);
    // } catch (e) {
    // 	data = (content as NodeJS.ArrayBufferView).toString();
    // }
    fs.writeFileSync(filename, content, options || { encoding: 'utf-8' });
  }
}

export const SystemHelper = SystemSingleton.getInstance();
