import 'reflect-metadata';

type PropertyKeyType = string | symbol | undefined;
type MetadataMapValueType = {
	callback: string;
	args: unknown[];
};
type MetadataMapType = Map<number, MetadataMapValueType[]>;

class ParamDecoratorHelper {
	private static self: ParamDecoratorHelper;
	private readonly metadataKey = Symbol(ParamDecoratorHelper.name);
	private readonly decoratorList: {
		[key: string]: CallableFunction;
	} = {};

	public static getInstance(): ParamDecoratorHelper {
		if (!ParamDecoratorHelper.self) {
			ParamDecoratorHelper.self = new ParamDecoratorHelper();
		}
		return ParamDecoratorHelper.self;
	}

	public decorateMethod(): MethodDecorator {
		return function (target, propertyKey, descriptor: PropertyDescriptor): PropertyDescriptor {
			const metadata = ParamDecoratorHelper.self.getMetadata(target, propertyKey);
			return {
				get() {
					return (...args: unknown[]) => {
						return (descriptor.value as (...args: unknown[]) => unknown).apply(
							this,
							args.map(function (value, key) {
								return metadata.has(key)
									? ParamDecoratorHelper.self.applyCallback(metadata.get(key) ?? [], value)
									: value;
							}),
						);
					};
				},
			};
		};
	}

	public decorateParam(index: string, callback: CallableFunction, ...args: unknown[]): ParameterDecorator {
		return function (target, propertyKey, parameterIndex): void {
			if (!ParamDecoratorHelper.self.getCallback(index)) {
				ParamDecoratorHelper.self.setCallback(index, callback);
			}
			(function (target, propertyKey, parameterIndex): void {
				// process.stdout.write(`${index}->${String(propertyKey)}[${parameterIndex}]`);
				const metadataMap = ParamDecoratorHelper.self.getMetadata(target, propertyKey);
				const metadata = (metadataMap.get(parameterIndex) ?? []).concat({
					args,
					callback: index,
				});
				metadataMap.set(parameterIndex, metadata);
				ParamDecoratorHelper.self.setMetadata(target, propertyKey, metadataMap);
			})(target, propertyKey, parameterIndex);
		};
	}

	private getMetadata(target: object, propertyKey: PropertyKeyType): MetadataMapType {
		if (!propertyKey) {
			throw new Error('propertyKey is required');
		}
		return (Reflect.getOwnMetadata(this.metadataKey, target, propertyKey) ?? new Map()) as MetadataMapType;
	}

	private setMetadata(target: object, propertyKey: PropertyKeyType, metadata: MetadataMapType): void {
		if (!propertyKey) {
			throw new Error('propertyKey is required');
		}
		Reflect.defineMetadata(this.metadataKey, metadata, target, propertyKey);
	}

	private setCallback(index: string, callback: CallableFunction): void {
		this.decoratorList[index] = callback;
	}

	private getCallback(index: string): CallableFunction {
		return this.decoratorList[index];
	}

	private applyCallback(metadata: MetadataMapValueType[], propertyValue: unknown): unknown {
		/** handle multiple decorators */
		return [...metadata].reverse().reduce(function (prev, curr) {
			return ParamDecoratorHelper.self.getCallback(curr.callback)(prev, ...curr.args);
		}, propertyValue);
	}
}

export const ParamDecorator = ParamDecoratorHelper.getInstance();
