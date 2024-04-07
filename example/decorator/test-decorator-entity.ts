import { IsNumber } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ConsoleHelper, DataHelper, DecoratorHelper, ValidatorHelper } from '../../src';

class Entity {
  @IsNumber()
  public key: number;
}

const Console = new ConsoleHelper({ info: false, link: false });
const Decorator = new DecoratorHelper('__FA_DECORATOR__');
/**/
const ClassDecorator = (data?: string): ClassDecorator => {
  // return Decorator.decorateClass(null);
  return Decorator.decorateClass((value) => {
    return value;
  }, data);
};
const MethodDecorator = (data?: unknown): MethodDecorator => {
  // return Decorator.decorateMethod(null);
  return Decorator.decorateMethod((value: Entity) => {
    return { key: Math.round(value.key) };
  }, data);
};
const ParamDecorator = (data?: unknown): ParameterDecorator => {
  // return Decorator.decorateParameter();
  return Decorator.decorateParameter((value: Entity, metadata) => {
    console.warn(metadata.class.data, metadata.method.data, metadata.parameter.data, value.key);
    Console.stdout('\n');
    const dto = plainToInstance(metadata.parameter.constructor as unknown as ClassConstructor<unknown>, value);
    const errors = ValidatorHelper.validateSync(dto);
    return errors ? errors : dto;
  }, data);
};

@ClassDecorator('ClassMetadata1')
class MockClass {
  @MethodDecorator('MethodMetadata1')
  public testEntity(
    @ParamDecorator('ParameterMetadata1') entity1: Entity,
    @ParamDecorator('ParameterMetadata2') entity2: Entity,
  ): Entity[] {
    console.log(`${this.constructor.name}.${this.testEntity.name}`);
    Console.stdout('\n');
    return [entity1, entity2];
  }
}

export function testDecoratorEntity(): void {
  const mock = new MockClass();
  const entity1 = { key: DataHelper.randomFloat(1, 10) };
  const entity2 = { key: DataHelper.randomFloat(1, 10) };
  console.info(mock.testEntity(entity1, entity2));
  // console.info(mock.testEntity({ key: '65fc5f5e08570267e7a5f292' }));
}
