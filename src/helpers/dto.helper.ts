import { validateSync, ValidationError, ValidatorOptions } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

class DtoHelper {
	private static self: DtoHelper;

	public static getInstance(): DtoHelper {
		if (!DtoHelper.self) {
			DtoHelper.self = new DtoHelper();
		}
		return DtoHelper.self;
	}

	public plainToInstanceValidateSync<DATA, DTO>(
		data: DATA,
		classConstructor: ClassConstructor<DTO>,
		options?: ValidatorOptions,
	): {
		dto: DTO;
		errors: string[] | null;
	} {
		const instance = plainToInstance(classConstructor, data);
		const errors = validateSync(instance as object, options);
		if (errors.length) {
			return { dto: instance, errors: this.validationErrors(errors) };
		}
		return { dto: instance, errors: null };
	}

	private validationErrors(data: ValidationError[], property?: string): string[] {
		return data.reduce((prev: string[], error) => {
			if (error.children?.length) {
				prev.push(...this.validationErrors(error.children, error.property));
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

export const FaDto = DtoHelper.getInstance();
