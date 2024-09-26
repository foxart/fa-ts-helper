import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { ValidatorService } from '../../services/validator.service';
import { Type } from 'class-transformer';
import { ErrorService } from '../../services/error.service';

enum TestEnum {
  A,
  B,
}

class TestItemDto {
  @IsString()
  public key: string;
}

class TestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  public fieldString: string;

  @IsEnum(TestEnum)
  public fieldEnum: TestEnum;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestItemDto)
  public fieldArray: TestItemDto[];
}

export function run(): void {
  const validator = new ValidatorService({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    whitelist: true,
  });
  const test1 = new TestItemDto();
  test1.key = '123';
  /** */
  const test2 = new TestItemDto();
  test2.key = 'lorem';
  /** */
  const test3 = new TestItemDto();
  // @ts-ignore
  test3.value = 'ipsum';
  test3.key = 'ipsum';
  /**
   *
   */
  const dto = new TestDto();
  dto.fieldArray = [test1, test2, test3];
  dto.fieldString = 'LOREM';
  const errors = validator.errorsSync(dto);
  console.error(new Error('XXX'));
  console.debug(errors);
  // console.log({ a: 1 });
}
