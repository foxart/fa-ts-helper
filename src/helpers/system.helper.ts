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

  public scanForFilesSync(directory: string, recursive: boolean, filter?: RegExp[]): string[] {
    const result = [];
    if (!fs.existsSync(directory)) {
      return [];
    }
    const entries = fs.readdirSync(directory);
    for (const entry of entries) {
      const fullPath = path.join(directory, entry);
      if (fs.lstatSync(fullPath).isDirectory()) {
        if (recursive) {
          result.push(...this.scanForFilesSync(fullPath, recursive, filter));
        }
      } else if (!filter || filter?.some((item) => item.test(fullPath))) {
        result.push(fullPath);
      }
    }
    return result;
  }

  public scanForDirectoriesSync(directory: string, recursive: boolean, filter?: RegExp[]): string[] {
    const result: string[] = [];
    if (!fs.existsSync(directory)) {
      return result;
    }
    const entries = fs.readdirSync(directory);
    for (const entry of entries) {
      const fullPath = path.join(directory, entry);
      if (fs.lstatSync(fullPath).isDirectory()) {
        if (recursive) {
          result.push(...this.scanForDirectoriesSync(fullPath, recursive, filter));
        }
        if (!filter || filter?.some((item) => item.test(fullPath))) {
          result.push(fullPath);
        }
      }
    }
    return result;
  }

  public writeFileSync(filename: string, content: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): void {
    try {
      const directory = path.dirname(filename);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {
          recursive: true,
        });
      }
      fs.writeFileSync(filename, content, options || { encoding: 'utf-8' });
    } catch (e) {
      console.error(e);
    }
  }
}

export const SystemHelper = SystemSingleton.getInstance();
