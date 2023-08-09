import 'reflect-metadata';

class MetadataMap extends Map {
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
		[key: string]: CallableFunction;
	} = {};

	public static getOwnMetadata(target: object, propertyKey: string | symbol): MetadataMap {
		return (
			<MetadataMap>Reflect.getOwnMetadata(ParamDecoratorHelper.metadataKey, target, propertyKey) || new MetadataMap()
		);
	}

	public static setOwnMetadata(target: object, propertyKey: string | symbol | undefined, metadata: MetadataMap): void {
		Reflect.defineMetadata(ParamDecoratorHelper.metadataKey, metadata, target, propertyKey || 'propertyKey');
	}

	public static setCallback(key: string, callback: CallableFunction): void {
		ParamDecoratorHelper.decoratorList[key] = callback;
	}

	public static getCallback(key: string): CallableFunction {
		return ParamDecoratorHelper.decoratorList[key];
	}

	public static applyCallback(metadata: MetadataMap, key: number, value: unknown): unknown {
		if (metadata.has(key)) {
			/** handle multiple decorators */
			return metadata.get(key).reduce((prev, curr) => {
				const callback = ParamDecoratorHelper.getCallback(curr);
				// console.error({ prev, curr });
				return callback(prev);
			}, value);
		} else {
			return value;
		}
	}
}

export function decorateMethod(): MethodDecorator {
	return function (target, propertyKey, descriptor: PropertyDescriptor): PropertyDescriptor {
		const metadata = ParamDecoratorHelper.getOwnMetadata(target, propertyKey);
		return {
			get() {
				return (...args: unknown[]) => {
					return descriptor.value.apply(
						this,
						args.map((value, key) => {
							return ParamDecoratorHelper.applyCallback(metadata, key, value);
						}),
					);
				};
			},
		};
	};
}

export function decorateParam(key: string, handler: CallableFunction): ParameterDecorator {
	return function (target, propertyKey, parameterIndex): void {
		if (!ParamDecoratorHelper.getCallback(key)) {
			// console.warn(handler);
			ParamDecoratorHelper.setCallback(key, handler);
		} else {
			throw new Error(`Decorator already registered: ${key}`);
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
