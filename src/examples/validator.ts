import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { ValidatorHelper } from '../helpers/validator.helper';
import 'reflect-metadata';

class dataNestedEntity {
  @IsNotEmpty()
  @IsString()
  public a?: string;
  @IsNotEmpty()
  @IsString()
  public b?: string;
  // public constructor(data: dataNestedEntity) {
  // 	this.name = data.name;
  // 	this.surname = data.surname;
  // }
}

class dataAttributesEntity {
  @IsNotEmpty()
  @IsString()
  public name?: string;
  @IsNotEmpty()
  @IsString()
  public surname?: string;
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  public nested?: dataNestedEntity;
  // public constructor(data: dataNestedEntity) {
  // 	this.name = data.name;
  // 	this.surname = data.surname;
  // }
}

class dataEntity {
  @IsNotEmpty()
  @IsNumber()
  public id?: number;
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  public attributes?: dataAttributesEntity;
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  public custom?: dataNestedEntity;
  // public constructor(data: dataEntity) {
  // 	this.id = data.id;
  // 	this.nested = data.nested;
  // }
}

async function testValidator(): Promise<void> {
  const dataPlain = {
    id: '1a',
    test: 'test value',
    attributes: {
      name: 'name value',
      surname: 'surname value',
      nested: {},
    },
    custom: {},
  };
  const dataClass = plainToInstance(dataEntity, dataPlain, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
    exposeUnsetFields: true,
  });
  const validateSync = ValidatorHelper.validateSync(dataClass, {
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    whitelist: true,
  });
  const validateAsync = await ValidatorHelper.validateAsync(dataClass, {
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    whitelist: true,
  });
  console.log({
    validateSync,
    validateAsync,
  });
}

void (async function (): Promise<void> {
  console.clear();
  await testValidator();
})();
