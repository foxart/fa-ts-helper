import { ConsoleHelper } from '../helpers/console.helper';
import { DataHelper } from '../helpers/data.helper';

class ObjectId {
	private readonly id: string;

	public constructor(id: string) {
		this.id = id;
	}

	public toString(): string {
		return this.id;
	}
}

const fields = {
	fieldUndefined: undefined,
	fieldNull: null,
	fieldNumber: 1,
	fieldZeroNumber: 0,
	fieldString: 'string',
	fieldEmptyString: '',
	fieldObjectId: new ObjectId('65aa4ceac632b427f4311ad3'),
	fieldDate: new Date(),
	test: {
		a: {
			body: { a: 1 },
		},
	},
};
const keys = {
	keyUndefined: undefined,
	keyNull: null,
	keyNumber: 1,
	keyZeroNumber: 0,
	keyString: 'string',
	keyEmptyString: '',
	keyObjectId: new ObjectId('65aa4ceac632b427f4311ad3'),
	keyDate: new Date(),
	keyArray: Object.values(fields),
	keyObject: { ...fields, keyFields: fields },
};

function testData(): void {
	const options = {
		undefined: true,
		null: true,
		zeroNumber: true,
		emptyString: true,
		exclude: ['fieldDate', 'keyDate', 'body'],
	};
	console.info('OBJECT', DataHelper.filter(keys, options));
	// console.info('ARRAY', DataHelper.filter([...Object.values(fields), { sub: Object.values(fields) }], options));
	//
}

void (function (): void {
	console.clear();
	ConsoleHelper.override();
	testData();
})();
