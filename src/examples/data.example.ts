import { DataHelper } from '../index';

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
  fieldZeroNumber: 0,
  fieldEmptyString: '',
  // fieldNumber: 1,
  // fieldString: 'string',
  fieldObjectId: new ObjectId('65aa4ceac632b427f4311ad3'),
  fieldDate: new Date(),
  fieldExclude: {
    body: { content: 'body' },
  },
  test1: {},
  test2: ['1'],
};
const keys = {
  keyUndefined: undefined,
  // keyNull: null,
  // keyNumber: 1,
  // keyZeroNumber: 0,
  // keyString: 'string',
  // keyEmptyString: '',
  // keyObjectId: new ObjectId('65aa4ceac632b427f4311ad3'),
  // keyDate: new Date(),
  keyArray: Object.values(fields),
  keyObject: { ...fields, keyFields: fields },
};

function testData(): void {
  const options = {
    undefined: true,
    null: true,
    zeroNumber: true,
    emptyString: true,
    exclude: ['body'],
    emptyObject: true,
  };
  console.info('SOURCE', keys);
  console.log('RESULT', DataHelper.filter(keys, options));
  // console.info('ARRAY', DataHelper.filter([...Object.values(fields), { sub: Object.values(fields) }], options));
  //
}

export function DataExample(): void {
  const example1 = 'LoremIpsumDolor';
  const example2 = 'loremIpsumDolor';
  const example3 = 'Lorem-Ipsum-Dolor';
  const example4 = 'lorem-Ipsum-Dolor';
  const example5 = { a: 'lorem-Ipsum-Dolor', b: new RegExp(example1, 'i') };
  // console.log(DataHelper.upperToSeparator(example1, '-'));
  // console.info(DataHelper.upperToSeparator(example2, '-'));
  // console.info(DataHelper.separatorToCamel(example3, '-'));
  // console.info(DataHelper.separatorToPascal(example4, '-'));
  console.log(DataHelper.filter(example5, { emptyObject: true }));
}
