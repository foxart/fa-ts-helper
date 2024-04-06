import { ConsoleHelper, DecoratorHelper, ValidatorHelper } from '../src';
import { IsNumber, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class Entity {
  @IsString()
  public key: string;

  @IsNumber()
  public value: number;
}

const Decorator = new DecoratorHelper('__FA_DECORATOR__');
const ClassDecorator = (value: unknown): ClassDecorator => {
  return Decorator.decorateClass(value);
};
const MethodDecorator = (): MethodDecorator => {
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
const ParamDecorator = (data: number): ParameterDecorator => {
  return Decorator.decorateParameter((value, metadata): unknown => {
    const tmp = metadata.classData as Record<string, number>;
    console.warn(data, tmp[data]);
    return value;
  });
};

enum Enum {
  METHOD_1,
  METHOD_2,
}

/**
 *
 */
@ClassDecorator('YYY')
class MockClass1 {
  private readonly console: ConsoleHelper;
}

@ClassDecorator(Enum)
class MockClass {
  private readonly console: ConsoleHelper;

  public constructor() {
    this.console = new ConsoleHelper({ info: false, link: false });
  }

  @MethodDecorator()
  public testEntity(@ParamDecoratorEntity() entity: Entity): void {
    this.console.log(this.constructor.name, this.testEntity.name);
    console.info({ entity });
    this.console.stdout('\n');
  }

  @MethodDecorator()
  public testSingle(@ParamDecoratorString('lorem') data: string): void {
    this.console.log(this.constructor.name, this.testSingle.name);
    console.info({ data });
    this.console.stdout('\n');
  }

  @MethodDecorator()
  public testMultiple(@ParamDecoratorString('1') @ParamDecoratorString('a') data: string): void {
    this.console.log(this.constructor.name, this.testMultiple.name);
    console.info({ data });
    this.console.stdout('\n');
  }

  @MethodDecorator()
  public testChain(@ParamDecoratorString('1') data: string): void {
    this.console.log(this.constructor.name, this.testChain.name);
    console.info({ data });
    this.console.stdout('\n');
    this.testChainCallback(data);
  }

  @MethodDecorator()
  public testChainCallback(@ParamDecoratorArray(['a', 'b', 'c']) data: string): void {
    this.console.log(this.constructor.name, this.testChainCallback.name);
    console.info({ data });
    this.console.stdout('\n');
  }

  @MethodDecorator()
  public test(@ParamDecorator(Enum.METHOD_2) data: unknown): void {
    this.console.log(this.constructor.name, this.test.name);
    console.info({ data });
    this.console.stdout('\n');
  }
}

export function testParamDecorator(): void {
  const mock = new MockClass();
  // mock.testEntity({ key: '65fc5f5e08570267e7a5f292', value: DataHelper.randomFloat(1, 10) });
  // mock.testSingle('single');
  // mock.testMultiple('multiple');
  // mock.testChain('chain');
  mock.test({ a: 1 });
  /**
   *
   */
}
