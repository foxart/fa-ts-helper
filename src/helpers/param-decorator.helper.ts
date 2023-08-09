import 'reflect-metadata';

type CallbackFunction = (...args: unknown[]) => unknown;
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
	private static decoratorList: {
		[key: string]: {
			callback: CallbackFunction;
			args?: unknown[];
		};
	} = {};

	public static get wrapMethod(): MethodType {
		return function (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
			// const keys = Reflect.getMetadataKeys(target, propertyKey);
			const metadataValue = ParamDecoratorHelper.getOwnMetadata(target, propertyKey);
			return {
				get() {
					return (...args: unknown[]) => {
						return (<CallbackFunction>descriptor.value).apply(
							this,
							args.map((item, index) => {
								if (metadataValue.has(index)) {
									return metadataValue.get(index).reduce((prev, curr) => {
										const decorator = ParamDecoratorHelper.getCallback(curr);
										return decorator.callback.call(this, prev, decorator.args);
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

	public static wrapParam(key: string, handler: CallbackFunction, additional: unknown[]): ParameterDecorator {
		return function (target, propertyKey, parameterIndex): void {
			if (!ParamDecoratorHelper.getCallback(key)) {
				console.warn(handler);
				//
				ParamDecoratorHelper.setCallback(key, handler, additional);
			} else {
				// throw new Error(`Decorator already registered: ${key}`);
			}
			return (function (target, propertyKey, parameterIndex): void {
				ParamDecoratorHelper.setOwnMetadata(
					target,
					propertyKey,
					ParamDecoratorHelper.getOwnMetadata(target, propertyKey || 'propertyKey').set(parameterIndex, key),
				);
			})(target, propertyKey, parameterIndex);
		};
	}

	private static getOwnMetadata(target: object, propertyKey: string | symbol): MetadataClass {
		return (
			<MetadataClass>Reflect.getOwnMetadata(ParamDecoratorHelper.metadataKey, target, propertyKey) ||
			new MetadataClass()
		);
	}

	private static setOwnMetadata(
		target: object,
		propertyKey: string | symbol | undefined,
		metadata: MetadataClass,
	): void {
		Reflect.defineMetadata(ParamDecoratorHelper.metadataKey, metadata, target, propertyKey || 'propertyKey');
	}

	private static setCallback(key: string, callback: CallbackFunction, args?: unknown[]): void {
		ParamDecoratorHelper.decoratorList[key] = { callback, args };
	}

	private static getCallback(key: string): { callback: CallbackFunction; args?: unknown[] } {
		return ParamDecoratorHelper.decoratorList[key];
	}
}
