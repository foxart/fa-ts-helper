import { ParamDecoratorHelper } from '../src/helpers/param-decorator.helper';

function ModelMethod(): MethodDecorator {
  return ParamDecoratorHelper.decorateMethod();
}

const Dec1 = (payload: string): ParameterDecorator => {
  const handler: CallableFunction = function (data: string, payload: string): string {
    return data.toUpperCase() + '<-' + payload;
  };
  return ParamDecoratorHelper.decorateParam(Dec1.name, handler, payload);
};
const Dec2 = (): ParameterDecorator => {
  const handler: CallableFunction = function (data: string): string {
    return `${data}<-Dec2`;
  };
  return ParamDecoratorHelper.decorateParam(Dec2.name, handler);
};

class Test {
  @ModelMethod()
  public create(@Dec1('CREATE') @Dec2() name: string, @Dec2() surname: string): void {
    console.info(`create -> ${name} ${surname}`);
  }

  @ModelMethod()
  public update(@Dec1('UPDATE1') name: string, @Dec2() @Dec1('UPDATE2') surname: string): void {
    console.info(`update -> ${name} ${surname}`);
  }

  @ModelMethod()
  public delete(@Dec1('DELETE') data: string): void {
    console.info({ data });
  }
}

function testParamDecorator(): void {
  const test = new Test();
  test.create('Name', 'Surname');
  test.update('Ivan', 'Kosenko');
}

void ((): void => {
  console.clear();
  testParamDecorator();
})();
