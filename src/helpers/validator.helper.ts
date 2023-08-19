import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';

interface UrlInterface {
	href: string;
	protocol: string;
	host: string;
	hostname: string;
	port: string;
	pathname: string;
	search: string;
	hash: string;
}

class ValidatorHelper {
	private static self: ValidatorHelper;
	private readonly urlRegexp: RegExp;

	public constructor() {
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
	public static getInstance(): ValidatorHelper {
		if (!ValidatorHelper.self) {
			ValidatorHelper.self = new ValidatorHelper();
		}
		return ValidatorHelper.self;
	}

	public testUrl(url: string): UrlInterface | null {
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

	public async validateAsync<T>(object: T | string, options?: ValidatorOptions): Promise<string[]> {
		return this.getValidationErrorList(await validate(object as object, options));
	}

	public validateSync<T>(object: T | string, options?: ValidatorOptions): string[] {
		return this.getValidationErrorList(validateSync(object as object, options));
	}

	private getValidationErrorList(data: ValidationError[], property?: string): string[] {
		return data.reduce((prev: string[], error) => {
			if (error.children?.length) {
				prev.push(...this.getValidationErrorList(error.children, error.property));
			} else {
				prev.push(
					...Object.entries(error.constraints as object).reduce((acc: string[], [, value]) => {
						if (property) {
							acc.push(`${property}.${value as string}`);
						} else {
							acc.push(value as string);
						}
						return acc;
					}, []),
				);
			}
			return prev;
		}, []);
	}
}

export const Validator = ValidatorHelper.getInstance();
