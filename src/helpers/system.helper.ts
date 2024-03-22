import * as fsPath from 'path';
import fs, { RmOptions, WriteFileOptions } from 'fs';

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

  public static getInstance(): SystemSingleton {
    if (!SystemSingleton.self) {
      SystemSingleton.self = new SystemSingleton();
    }
    return SystemSingleton.self;
  }

  public packageInfo(path: string): PackageInfoInterface {
    let result: PackageInfoInterface;
    try {
      result = JSON.parse(SystemHelper.readFileSync(path)) as PackageInfoInterface;
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

  public scanForFilesSync(directory: string, recursive: boolean, filter?: RegExp[]): string[] {
    const result = [];
    if (!fs.existsSync(directory)) {
      return [];
    }
    const entries = fs.readdirSync(directory);
    for (const entry of entries) {
      const fullPath = fsPath.join(directory, entry);
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
      const fullPath = fsPath.join(directory, entry);
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

  public removeSync(path: string | string[], options?: RmOptions): void {
    (Array.isArray(path) ? path : [path]).forEach((item) => {
      fs.rm(fsPath.resolve(item), options || {}, (e) => {
        if (e) {
          console.error(e);
        }
      });
    });
  }

  public readFileSync(path: string): string {
    try {
      return fs.readFileSync(fsPath.resolve(path), 'utf8');
    } catch (e) {
      console.error(e);
    }
    return '';
  }

  public writeFileSync(path: string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): void {
    try {
      const directory = fsPath.dirname(path);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {
          recursive: true,
        });
      }
      fs.writeFileSync(path, data, options || { encoding: 'utf-8' });
    } catch (e) {
      console.error(e);
    }
  }
}

export const SystemHelper = SystemSingleton.getInstance();
