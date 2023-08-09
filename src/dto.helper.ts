import { validateSync, ValidationError, ValidatorOptions } from 'class-validator';

function validationErrors(data: ValidationError[], property?: string): string[] {
	return data.reduce((prev: string[], error) => {
		if (error.children?.length) {
			prev.push(...validationErrors(error.children, error.property));
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

function validate<T>(dto: T, options?: ValidatorOptions): { dto: T; errors: string[] | null } {
	const errors = validateSync(dto as object, options);
	if (errors.length) {
		return { dto, errors: validationErrors(errors) };
	}
	return { dto, errors: null };
}

export const dtoHelper = {
	validate,
};
