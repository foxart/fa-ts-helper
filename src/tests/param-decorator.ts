import { debugHelper } from '../helpers/debug.helper';
import { ParamDecoratorHelper, decorateMethod, decorateParam } from '../helpers/param-decorator.helper';

debugHelper.config();

function ModelMethod(): MethodDecorator {
	return decorateMethod();
}

function Dec1(payload: string): ParameterDecorator {
	// console.log({ payload: payload });
	const handler: CallableFunction = function (data: string): string {
		return data.toUpperCase();
	};
	return decorateParam(Dec1.name, handler);
}

function Dec2(): ParameterDecorator {
	const handler: CallableFunction = function (data: string): string {
		return `[ ${data} ]`;
	};
	return decorateParam(Dec2.name, handler);
}

class Test {
	@ModelMethod()
	create(@Dec1('CREATE') @Dec2() name: string, surname: string) {
		console.info(`create -> ${name} ${surname}`);
	}

	@ModelMethod()
	update(@Dec1('UPDATE1') name: string, @Dec1('UPDATE2') surname: string) {
		console.info(`update -> ${name} ${surname}`);
	}

	// @ModelMethod()
	// delete(@ModelParamDto('DELETE') data: string) {
	// 	console.info({ data });
	// }
}

const test = new Test();
test.create('Name', 'Surname');
// test.update('Ivan', 'Kosenko');
