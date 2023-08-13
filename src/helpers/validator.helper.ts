import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';

class ValidatorHelper {
	private static self: ValidatorHelper;

	public static getInstance(): ValidatorHelper {
		if (!ValidatorHelper.self) {
			ValidatorHelper.self = new ValidatorHelper();
		}
		return ValidatorHelper.self;
	}

	public async validateAsync<T>(object: T, options?: ValidatorOptions): Promise<string[]> {
		return this.getValidationErrorList(await validate(object as object, options));
	}

	public validateSync<T>(object: T, options?: ValidatorOptions): string[] {
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
