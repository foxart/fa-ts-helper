import { IsNumber, IsString } from 'class-validator';
import { FaDebug, FaDto } from '../index';

class Entity {
	@IsNumber()
	public id!: number;
	@IsString()
	public name!: number;
}

export function testDto() {
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
	const trace = FaDebug.getTrace(new Error('test'), {
		// short: true,
		// filter: /node_modules\//,
		// omit: /node_modules\//,
	});
	console.error(trace);
	// FaDebug.debug(result.errors);
}
