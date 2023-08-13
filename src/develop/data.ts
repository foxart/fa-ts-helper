import { HelperData } from '../index';
import { ObjectId } from 'mongodb';

const fields = {
	fieldNumber: 1,
	fieldUndefined: undefined,
	fieldNull: null,
	fieldEmptyString: '',
	fieldZeroValue: 0,
	fieldObjectId: new ObjectId(),
	fieldsDate: new Date(),
};
const data = {
	keyArray: Object.values(fields),
	keyObject: fields,
	keyUndefined: undefined,
	keyNull: null,
	keyEmptyString: '',
	keyZeroNumber: 0,
};

export function testData(): void {
	const options = {
		undefined: true,
		null: true,
		zeroNumber: true,
		emptyString: true,
	};
	const result1 = HelperData.filter(data, options);
	const result2 = HelperData.filter([data, Object.values(fields)], options);
	console.info('object', result1);
	console.info('array', result2);
}
