import { validateSync, ValidationError, ValidatorOptions } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ClassTransformOptions } from 'class-transformer/types/interfaces';
import { deprecate } from 'util';

class DtoHelper {
	private static self: DtoHelper;
	private readonly transformerOptions: ClassTransformOptions;
	private readonly validatorOptions: ValidatorOptions;

	private constructor() {
		this.transformerOptions = {};
		this.validatorOptions = {};
	}

	public static getInstance(): DtoHelper {
		if (!DtoHelper.self) {
			DtoHelper.self = new DtoHelper();
		}
		return DtoHelper.self;
	}

	public plainToInstanceValidateSync<DATA, DTO>(
		data: DATA,
		constructor: ClassConstructor<DTO>,
		options?: {
			transformer?: ClassTransformOptions;
			validator?: ValidatorOptions;
		},
	): {
		dto: DTO;
		errors: string[] | null;
	} {
		const instance = plainToInstance(constructor, data, options?.transformer ?? this.transformerOptions);
		const errors = validateSync(instance as object, options?.validator ?? this.validatorOptions);
		if (errors.length) {
			return {
				dto: instance,
				errors: this.validationErrors(errors),
			};
		}
		return {
			dto: instance,
			errors: null,
		};
		//
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

/**
 * @deprecated should be replaced by ValidateHelper and TransformHelper
 */
export const FaDto = DtoHelper.getInstance();
