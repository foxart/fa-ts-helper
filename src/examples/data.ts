import { ConsoleHelper } from '../helpers/console.helper';
import { DataHelper } from '../helpers/data.helper';
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

function testData(): void {
	const options = {
		undefined: true,
		// null: true,
		zeroNumber: true,
		emptyString: true,
	};
	const result1 = DataHelper.filter(data, options);
	const result2 = DataHelper.filter([data, Object.values(fields)], options);
	console.info('object', result1);
	console.info('array', result2);
}

void (function (): void {
	console.clear();
	ConsoleHelper.overwriteConsole();
	testData();
})();
