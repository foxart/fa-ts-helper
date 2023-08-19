import { HelperValidator } from '../../src';
import { plainToInstance } from 'class-transformer';
import { IsString } from 'class-validator';

class ValidatorClass {
	@IsString()
	public a!: string;
}

export async function testValidator(): Promise<void> {
	const dataPlain = { a: 1 };
	const dataClass = plainToInstance(ValidatorClass, dataPlain);
	const validateSync = HelperValidator.validateSync(dataClass);
	const validateAsync = await HelperValidator.validateAsync(dataClass);
	const testUrl = HelperValidator.testUrl('http://localhost');
	console.log({
		// testUrl,
		dataClass,
		validateSync,
		validateAsync,
	});
}
