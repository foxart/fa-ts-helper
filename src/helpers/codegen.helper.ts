import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as childProcessExec } from 'child_process';
import { ColorHelper } from './color.helper';

const exec = promisify(childProcessExec);
const { foreground, background, effect, symbol } = ColorHelper;

class CodegenSingleton {
  private static self: CodegenSingleton;

  public static getInstance(): CodegenSingleton {
    if (!CodegenSingleton.self) {
      CodegenSingleton.self = new CodegenSingleton();
    }
    return CodegenSingleton.self;
  }

  public message(name: string, msg: string): void {
    const result = [ColorHelper.wrapData(` ${name.toUpperCase()} `, background.cyan)];
    if (msg) {
      result.push(ColorHelper.wrapData(` ${msg}`, foreground.cyan), ' ');
    }
    console.log(result.join(''));
  }

  public success(name: string, msg: string): void {
    const result = [
      ColorHelper.wrapData(name, foreground.white),
      ' ',
      ColorHelper.wrapData(symbol.success, [effect.bright, foreground.green]),
      ' ',
      ColorHelper.wrapData(msg, [effect.dim, foreground.green]),
    ];
    console.log(result.join(''));
  }

  public error(name: string, msg: string, err: Error): void {
    const result = [
      ColorHelper.wrapData(name, foreground.white),
      ' ',
      ColorHelper.wrapData(symbol.error, [effect.bright, foreground.red]),
      ' ',
      ColorHelper.wrapData(msg, [effect.dim, foreground.red]),
    ];
    if (err) {
      result.push(' ', ColorHelper.wrapData(err.message ?? err.name, foreground.red));
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
      const json = (await response.json()) as unknown;
      this.success('fetch', host);
      return json;
    } catch (err) {
      this.error('fetch', host, err as Error);
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
      const text = await response.text();
      this.success('fetch', host);
      return text;
    } catch (err) {
      this.error('fetch', host, err as Error);
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
    } catch (err) {
      this.error('build', path.basename(file), err as Error);
    }
  }
}

export const CodegenHelper = CodegenSingleton.getInstance();
