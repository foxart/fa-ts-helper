import { DebugHelper } from '../helpers/debug.helper';
import { ParamDecoratorHelper } from '../helpers/param-decorator.helper';
import { FaParamDecorator } from '../index';

DebugHelper.config();

function ModelMethod(): MethodDecorator {
	return FaParamDecorator.decorateMethod();
}

const Dec1 = (payload: string): ParameterDecorator => {
	const handler: CallableFunction = function (data: string, payload: string): string {
		return data.toUpperCase() + '<-' + payload;
	};
	return FaParamDecorator.decorateParam(Dec1.name, handler, payload);
};

const Dec2 = (): ParameterDecorator => {
	const handler: CallableFunction = function (data: string): string {
		return `${data}<-Dec2`;
	};
	return FaParamDecorator.decorateParam(Dec2.name, handler);
};

class Test {
	@ModelMethod()
	create(@Dec1('CREATE') @Dec2() name: string, @Dec2() surname: string) {
		console.info(`create -> ${name} ${surname}`);
	}

	@ModelMethod()
	update(@Dec1('UPDATE1') name: string, @Dec2() @Dec1('UPDATE2') surname: string) {
		console.info(`update -> ${name} ${surname}`);
	}

	// @ModelMethod()
	// delete(@ModelParamDto('DELETE') data: string) {
	// 	console.info({ data });
	// }
}

export function paramDecoratorTest() {
	const test = new Test();
	test.create('Name', 'Surname');
	test.update('Ivan', 'Kosenko');
}
