import path from 'path';

interface ParserStackOptionInterface {
  short?: boolean;
  index?: number;
}

interface UrlInterface {
  href: string;
  protocol?: string;
  host?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

class ParserSingleton {
  private static self: ParserSingleton;
  private readonly cwd: string;
  private readonly stackRegexp: RegExp;
  private readonly urlRegexp: RegExp;

  private constructor() {
    this.cwd = process.cwd();
    this.stackRegexp = /\((\/?.+:\d+:\d+)\)/gm;
    this.urlRegexp = new RegExp(
      [
        '^(https?:)//', // protocol
        '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
        '(/{0,1}[^?#]*)', // pathname
        '(\\?[^#]*|)', // search
        '(#.*|)$', // hash
      ].join(''),
    );
  }

  public static getInstance(): ParserSingleton {
    if (!ParserSingleton.self) {
      ParserSingleton.self = new ParserSingleton();
    }
    return ParserSingleton.self;
  }

  public stack(stack?: string, options?: ParserStackOptionInterface): string[] {
    let result: string[] = [];
    let match = this.stackRegexp.exec(stack || '');
    while (match) {
      if (match[0].indexOf(this.cwd) !== -1) {
        result.push(match[1]);
      }
      match = this.stackRegexp.exec(stack || '');
    }
    if (options?.index) {
      result = result[options.index] ? [result[options.index]] : [result[1]];
    }
    if (options?.short) {
      result = result.map((item) => path.relative(this.cwd, item));
    }
    return result;
  }

  public url(url: string): UrlInterface | null {
    const match = url.match(this.urlRegexp);
    return (
      match && {
        href: url,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7],
      }
    );
  }
}

export const ParserHelper = ParserSingleton.getInstance();
