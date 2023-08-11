import { IsNumber, IsString } from 'class-validator';
import { FaDebug, FaDto } from '../index';

class Entity {
	@IsNumber()
	public id!: number;
	@IsString()
	public name!: number;
}

export function testDto(): void {
	const data = {
		id: 1,
		name: 'Name',
		surname: 'Surname',
	};
	const result = FaDto.plainToInstanceValidateSync(data, Entity, {
		validator: {
			whitelist: true,
			forbidNonWhitelisted: true,
		},
	});
	FaDebug.log(result.errors);
}
