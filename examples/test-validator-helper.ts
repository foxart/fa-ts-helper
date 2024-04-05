import { plainToInstance, Type } from 'class-transformer';
import { IsArray, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { ValidatorHelper } from '../src';
import 'reflect-metadata';

class PayloadObjectArrayEntity {
  @IsString()
  public string: string;

  @IsNumber()
  public number: number;

  // public constructor(data: dataNestedEntity) {
  // 	this.name = data.name;
  // 	this.surname = data.surname;
  // }
}

class PayloadObjectEntity {
  @IsString()
  public name: string;

  @IsString()
  public surname: string;

  @IsArray()
  @ValidateNested()
  @Type(() => PayloadObjectArrayEntity)
  public array: PayloadObjectArrayEntity[];

  // public constructor(data: dataNestedEntity) {
  // 	this.name = data.name;
  // 	this.surname = data.surname;
  // }
}

class PayloadEntity {
  @IsString()
  public id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PayloadObjectEntity)
  public object: PayloadObjectEntity;

  // public constructor(data: dataEntity) {
  // 	this.id = data.id;
  // 	this.nested = data.nested;
  // }
}

function validateSync(payload: unknown): void {
  const data = plainToInstance(PayloadEntity, payload, {
    enableImplicitConversion: false,
    exposeDefaultValues: false,
    exposeUnsetFields: true,
  });
  const errors = ValidatorHelper.validateSync(data, {
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    whitelist: true,
  });
  if (errors) {
    console.error(errors);
  }
  console.log(validateSync.name, {
    data,
    errors,
  });
}

export function testValidatorHelper(): void {
  const payload = {
    id: '660bba44fe631e9f9f30e043',
    object: {
      name: 'Name',
      surname: 'Surname',
      array: [{ number: 1, string: 'test' }],
    },
  };
  validateSync(payload);
}
