import { FaValidator } from '../index';
import { plainToInstance } from 'class-transformer';
import { IsString } from 'class-validator';

class ValidatorClass {
	@IsString()
	public a!: string;
}

export async function testValidator(): Promise<void> {
	const dataPlain = { a: 1 };
	const dataClass = plainToInstance(ValidatorClass, dataPlain);
	const syncResult = FaValidator.validateSync(dataClass);
	const asyncResult = await FaValidator.validateAsync(dataClass);
	console.log({
		dataClass,
		syncResult,
		asyncResult,
	});
}
