import { ConsoleHelper, DecoratorHelper, ValidatorHelper } from '../src';
import { IsNumber, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class Entity {
  @IsString()
  public key: string;

  @IsNumber()
  public value: number;
}

enum ClassEnum {
  METHOD_1 = 'ENUM-1',
  METHOD_2 = 'ENUM-2',
}

const Console = new ConsoleHelper({ info: false, link: false });
const Decorator = new DecoratorHelper('__FA_DECORATOR__');
const ClassDecorator = (value: unknown): ClassDecorator => {
  return Decorator.decorateClass(value);
};
const MethodDecorator = (data?: unknown): MethodDecorator => {
  return Decorator.decorateMethod();
};
const ParamDecoratorEntity = (): ParameterDecorator => {
  return Decorator.decorateParameter((value, metadata): unknown => {
    const dto = plainToInstance(metadata.paramConstructor, value, {
      enableImplicitConversion: false,
      exposeDefaultValues: false,
      exposeUnsetFields: true,
    });
    const errors = ValidatorHelper.validateSync(dto, {
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
    });
    if (errors) {
      console.error({ errors });
      return null;
    }
    return dto;
  });
};
const ParamDecoratorArray = (data: string[]): ParameterDecorator => {
  return Decorator.decorateParameter((value): string => {
    return `${value}-[${data.join(', ')}]`;
  });
};
const ParamDecoratorString = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter((value, metadata): string => {
    return `${value}-${data}`;
  });
};
/**
 *
 */
const ParamDecorator = (data: ClassEnum): ParameterDecorator => {
  return Decorator.decorateParameter((value, metadata): unknown => {
    // const record = metadata.classData as Record<string, number>;
    // console.warn({ enum: { key: record[data], value: data } });
    // Console.stdout('\n');
    return `${value}-${data}`;
  });
};
const MethodDecoratorTest = (data: typeof ClassEnum): MethodDecorator => {
  return Decorator.decorateMethod((value) => {
    console.info({ data, value });
    Console.stdout('\n');
    // console.log({ value, metadata: metadata.classData });
    // return [`${value} method`];
    return [`${value}-method`];
  });
};

export function testParamDecorator(): void {
  const mock = new MockClass();
  // mock.testEntity({ key: '65fc5f5e08570267e7a5f292', value: DataHelper.randomFloat(1, 10) });
  // mock.testSingle('single');
  // mock.testMultiple('multiple');
  // mock.testChain('chain');
  /**
   *
   */
  const result = mock.test('test1Value', 'test2Value');
  console.error(result);
  Console.stdout('\n');
}

@ClassDecorator(ClassEnum)
class MockClass {
  @MethodDecoratorTest(ClassEnum)
  // public test(@ParamDecorator(ClassEnum.METHOD_1) data: unknown): unknown {
  public test(
    @ParamDecorator(ClassEnum.METHOD_1) param1: string,
    // @ParamDecorator(ClassEnum.METHOD_2) param2?: unknown,
    param2?: unknown,
  ): unknown {
    console.log(`${this.constructor.name}.${this.test.name}`, { param1, param2 });
    Console.stdout('\n');
    return { param1, param2 };
  }

  @MethodDecorator()
  public testEntity(@ParamDecoratorEntity() entity: Entity): void {
    Console.log(this.constructor.name, this.testEntity.name);
    console.info({ entity });
    Console.stdout('\n');
  }

  @MethodDecorator()
  public testSingle(@ParamDecoratorString('stringParam') data: string): void {
    Console.log(this.constructor.name, this.testSingle.name);
    console.info({ data });
    Console.stdout('\n');
  }

  @MethodDecorator()
  public testMultiple(@ParamDecoratorString('1') @ParamDecoratorString('a') data: string): void {
    Console.log(this.constructor.name, this.testMultiple.name);
    console.info({ data });
    Console.stdout('\n');
  }

  @MethodDecorator()
  public testChain(@ParamDecoratorString('1') data: string): void {
    Console.log(this.constructor.name, this.testChain.name);
    console.info({ data });
    Console.stdout('\n');
    this.testChainCallback(data);
  }

  @MethodDecorator()
  public testChainCallback(@ParamDecoratorArray(['a', 'b', 'c']) data: string): void {
    Console.log(this.constructor.name, this.testChainCallback.name);
    console.info({ data });
    Console.stdout('\n');
  }
}
