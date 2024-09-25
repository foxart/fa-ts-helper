import { IsOptional, IsString } from 'class-validator';
import { DataHelper } from '../../helpers/data.helper';
import { ConverterHelper } from '../../helpers/converter.helper';

class ObjectId {
  private readonly id: string;

  public constructor() {
    this.id = '65aa4ceac632b427f4311ad3';
  }

  public toString(): string {
    return this.id;
  }
}

class TestDto {
  @IsOptional()
  @IsString()
  public id?: string;
}

function splitObjectByTrueFalse(obj: { [key: string]: boolean }): {
  trueValues: { [key: string]: boolean };
  falseValues: { [key: string]: boolean };
} {
  const trueValues: { [key: string]: boolean } = {};
  const falseValues: { [key: string]: boolean } = {};
  for (const key in obj) {
    if (obj[key]) {
      trueValues[key] = obj[key];
    } else {
      falseValues[key] = obj[key];
    }
  }
  return { trueValues, falseValues };
}

export function run(): void {
  const dto = new TestDto();
  dto.id = 'ID';
  const testData = {
    undefined: undefined,
    null: null,
    zeroNumber: 0,
    emptyString: '',
    emptyArray: [],
    emptyObject: {},
    emptyClass: new TestDto(),
    number: 1,
    string: 'string',
    array: [1, 'string'],
    object: { keyNumber: 1, keyString: '2' },
    class: dto,
    objectId: new ObjectId(),
    date: new Date(),
    regex: new RegExp('/.+/g'),
  };
  // console.log(splitObjectByTrueFalse(checkIsClass(testData)));
  console.log(
    splitObjectByTrueFalse(
      ConverterHelper.mapDataValues(testData, (value) => {
        return DataHelper.isInstanceObject(value);
      }),
    ),
  );
}
