import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as childProcessExec } from 'child_process';
import { ColorHelper } from './color.helper';

const exec = promisify(childProcessExec);
const { effect, foreground } = ColorHelper;

class CodegenSingleton {
  private static self: CodegenSingleton;

  public static getInstance(): CodegenSingleton {
    if (!CodegenSingleton.self) {
      CodegenSingleton.self = new CodegenSingleton();
    }
    return CodegenSingleton.self;
  }

  public message(name: string, msg: string): void {
    const result = ['[', effect.bright, foreground.cyan, name.toUpperCase(), effect.reset, ']'];
    if (msg) {
      result.push(' ', effect.bright, foreground.blue, msg, effect.reset);
    }
    console.log(result.join(''));
  }

  public success(name: string, msg: string): void {
    const result = [foreground.yellow, name, ' ', effect.reset, foreground.green, '✔', effect.reset];
    if (msg) {
      result.push(' ', effect.dim, msg, effect.reset);
    }
    console.log(result.join(''));
  }

  public error(name: string, msg: string, e: Error): void {
    const result = [foreground.magenta, name, ' ', effect.reset, foreground.red, '✖', effect.reset];
    if (msg) {
      result.push(' ', msg);
    }
    if (e) {
      result.push(' ', foreground.red, e.message, effect.reset);
    }
    console.log(result.join(''));
  }

  public async fetchJson(host: string, init: RequestInit): Promise<unknown | null> {
    try {
      const response = await fetch(host, init);
      if (!response.ok) {
        this.error('fetch', host, new Error(response.statusText));
        return null;
      }
      this.success('fetch', host);
      return (await response.json()) as unknown;
    } catch (e) {
      this.error('fetch', host, e as Error);
      return null;
    }
  }

  public async fetchTxt(host: string, init: RequestInit): Promise<string | null> {
    try {
      const response = await fetch(host, init);
      if (!response.ok) {
        this.error('fetch', host, new Error(response.statusText));
        return null;
      }
      this.success('fetch', host);
      return await response.text();
    } catch (e) {
      this.error('fetch', host, e as Error);
      return null;
    }
  }

  public async buildProto(source: string, destination: string, file: string): Promise<void> {
    try {
      fs.mkdirSync(destination, { recursive: true });
      const command = [
        'protoc',
        `--proto_path=${source}`,
        `--js_out=import_style=commonjs,binary:${destination}`,
        // `--csharp_out=${destination}`,
        `--ts_out=${destination}`,
        file,
      ];
      await exec(command.join(' '));
      this.success('build', path.basename(file));
    } catch (e) {
      this.error('build', path.basename(file), e as Error);
    }
  }
}

export const CodegenHelper = CodegenSingleton.getInstance();
