import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';

class ValidatorHelper {
	private static self: ValidatorHelper;

	public static getInstance(): ValidatorHelper {
		if (!ValidatorHelper.self) {
			ValidatorHelper.self = new ValidatorHelper();
		}
		return ValidatorHelper.self;
	}

	public async validateAsync(object: object, options?: ValidatorOptions): Promise<string[]> {
		return this.extractErrors(await validate(object, options));
	}

	public validateSync(object: object, options?: ValidatorOptions): string[] {
		return this.extractErrors(validateSync(object, options));
	}

	private extractErrors(data: ValidationError[], property?: string): string[] {
		return data.reduce((prev: string[], error) => {
			if (error.children?.length) {
				prev.push(...this.extractErrors(error.children, error.property));
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

export const FaValidator = ValidatorHelper.getInstance();
