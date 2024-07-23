import path from 'path';
import fs, { ObjectEncodingOptions, WriteFileOptions } from 'fs';
import process from 'node:process';

export interface PackageInfoInterface {
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  license?: string;
  private?: string;
  homepage?: string;
}

class SystemSingleton {
  private static self: SystemSingleton;
  private readonly timeMap: Map<string, [number, number]>;

  private constructor() {
    this.timeMap = new Map();
  }

  public static getInstance(): SystemSingleton {
    if (!SystemSingleton.self) {
      SystemSingleton.self = new SystemSingleton();
    }
    return SystemSingleton.self;
  }

  public timeStart(label?: string): void {
    this.timeMap.set(label ?? 'default', process.hrtime());
  }

  public timeEnd(label?: string): number {
    const diff = process.hrtime(this.timeMap.get(label ?? 'default'));
    this.timeMap.delete(label ?? 'default');
    return parseFloat((diff[0] * 1e3 + diff[1] / 1e6).toFixed(3));
  }

  public packageInfo(directory: string): PackageInfoInterface {
    let result: PackageInfoInterface;
    try {
      result = JSON.parse(SystemHelper.readFileSync(directory).toString()) as PackageInfoInterface;
    } catch (e) {
      result = {};
    }
    return result;
  }

  public sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout((): void => {
        resolve();
      }, ms);
    });
  }

  public scanDirectoriesSync(directory: string, filter?: RegExp[]): string[] {
    const result: string[] = [];
    if (!fs.existsSync(directory)) {
      return result;
    }
    const entries = fs.readdirSync(directory);
    for (const entry of entries) {
      const fullPath = path.join(directory, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        if (!filter || filter?.some((item) => item.test(fullPath))) {
          result.push(fullPath);
        }
        result.push(...this.scanDirectoriesSync(fullPath, filter));
      }
    }
    return result;
  }

  public createDirectorySync(directory: string): void {
    try {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
    } catch (e) {
      console.error(e);
    }
  }

  public deleteDirectorySync(directory: string, onlyEmpty?: boolean): void {
    try {
      if (onlyEmpty) {
        fs.readdirSync(directory).forEach((file) => {
          const fullPath = path.join(directory, file);
          if (fs.lstatSync(fullPath).isDirectory()) {
            this.deleteDirectorySync(fullPath, onlyEmpty);
          }
        });
        if (fs.readdirSync(directory).length === 0) {
          fs.rmdirSync(directory);
        }
      } else if (fs.statSync(directory).isDirectory()) {
        fs.rmSync(directory, { recursive: true, force: true });
      }
    } catch (e) {
      console.error(e);
    }
  }

  public scanFilesSync(directory: string, filter?: RegExp[]): string[] {
    if (!fs.existsSync(directory)) {
      return [];
    }
    const result: string[] = [];
    const entries = fs.readdirSync(directory);
    for (const entry of entries) {
      const fullPath = path.join(directory, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        result.push(...this.scanFilesSync(fullPath, filter));
      } else if (
        !filter ||
        filter?.some((item) => {
          return item.test(fullPath);
        })
      ) {
        result.push(fullPath);
      }
    }
    return result;
  }

  public createFileSync(filePath: string, content: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): void {
    try {
      this.createDirectorySync(path.dirname(filePath));
      fs.writeFileSync(filePath, content, options || { encoding: 'utf-8' });
    } catch (e) {
      console.error(e);
    }
  }

  public deleteFileSync(filePath: string): void {
    try {
      if (fs.lstatSync(filePath).isFile()) {
        fs.rmSync(filePath, { force: true });
      }
    } catch (e) {
      console.error(e);
    }
  }

  public readFileSync(
    filePath: string,
    options?: (ObjectEncodingOptions & { flag?: string | undefined }) | BufferEncoding,
  ): string | Buffer {
    try {
      return fs.readFileSync(filePath, options || { encoding: 'utf8' });
    } catch (e) {
      console.error(e);
    }
    return '';
  }
}

export const SystemHelper = SystemSingleton.getInstance();
