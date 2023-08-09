import 'reflect-metadata';

type DescriptorType = (...args: unknown[]) => unknown;
type ParameterArgs = [target: object, propertyKey: string | symbol, parameterIndex: number];
type ParameterType<I, O> = (parameter: I) => O;
type MethodType = (target: object, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

class MetadataClass extends Map {
	public override get(key: number): string[] {
		return Array.from(<string[]>super.get(key)).reverse();
	}

	public override set(key: number, value: string): this {
		return super.set(key, (<string[]>super.get(key) || []).concat(value));
	}
}

export class ParamDecoratorHelper {
	private static readonly metadataKey = Symbol('DecoratorClass');
	private static decoratorList: { [key: string]: ParameterType<unknown, unknown> } = {};

	public static get wrapMethod(): MethodType {
		return function (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
			// const keys = Reflect.getMetadataKeys(target, propertyKey);
			const metadataValue = ParamDecoratorHelper.getOwnMetadata(target, propertyKey);
			return {
				// configurable: descriptor.configurable,
				// enumerable: descriptor.enumerable,
				// writable: descriptor.writable,
				get(): DescriptorType {
					return (...args: unknown[]) => {
						return (<DescriptorType>descriptor.value).apply(
							this,
							args.map((item, index) => {
								if (metadataValue.has(index)) {
									return metadataValue.get(index).reduce((prev, curr) => {
										return ParamDecoratorHelper.getCallback(curr).call(this, prev);
									}, item);
								} else {
									return item;
								}
							}),
						);
					};
				},
			};
		};
	}

	public static wrapParam(key: string, handler: (value: unknown) => unknown): (...args: ParameterArgs) => void {
		return function (...args: ParameterArgs): void {
			if (!ParamDecoratorHelper.getCallback(key)) {
				ParamDecoratorHelper.setCallback(key, handler);
			} else {
				// throw new Error(`Decorator already registered: ${key}`);
			}
			return (function (target, propertyKey, parameterIndex): void {
				ParamDecoratorHelper.setOwnMetadata(
					target,
					propertyKey,
					ParamDecoratorHelper.getOwnMetadata(target, propertyKey).set(parameterIndex, key),
				);
			})(...args);
		};
	}

	private static getOwnMetadata(target: object, propertyKey: string | symbol): MetadataClass {
		return (
			<MetadataClass>Reflect.getOwnMetadata(ParamDecoratorHelper.metadataKey, target, propertyKey) ||
			new MetadataClass()
		);
	}

	private static setOwnMetadata(target: object, propertyKey: string | symbol, metadataValue: MetadataClass): void {
		Reflect.defineMetadata(ParamDecoratorHelper.metadataKey, metadataValue, target, propertyKey);
	}

	private static setCallback<I, O>(key: string, func: ParameterType<I, O>): void {
		ParamDecoratorHelper.decoratorList[key] = func as ParameterType<unknown, unknown>;
	}

	private static getCallback<I, O>(key: string): ParameterType<I, O> {
		return <ParameterType<I, O>>ParamDecoratorHelper.decoratorList[key];
	}
}
