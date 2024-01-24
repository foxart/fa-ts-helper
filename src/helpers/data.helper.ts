interface OptionsInterface {
	undefined?: boolean;
	null?: boolean;
	emptyString?: boolean;
	zeroNumber?: boolean;
}

class DataSingleton {
	private static self: DataSingleton;
	private readonly characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	public static getInstance(): DataSingleton {
		if (!DataSingleton.self) {
			DataSingleton.self = new DataSingleton();
		}
		return DataSingleton.self;
	}

	public randomNumber(min: number, max: number, int = true): number {
		const random = Math.random() * (max - min + 1) + min;
		return int ? Math.floor(random) : random;
	}

	public randomString(length: number): string {
		let counter = 0;
		let result = '';
		while (counter < length) {
			result += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
			counter++;
		}
		return result;
	}

	public filter<T>(data: T, options: OptionsInterface): T {
		if (Array.isArray(data)) {
			return data
				.filter((item) => {
					return this.isValid(item, options);
				})
				.map((item: T) => {
					return this.filter(item, options);
				}) as T;
		}
		if (this.isObject(data)) {
			return Object.entries(data as Record<string, unknown>).reduce((acc, [key, value]) => {
				if (this.isObject(value)) {
					return {
						...acc,
						[key]: this.filter(value, options),
					};
				} else {
					return this.isValid(value, options)
						? {
								...acc,
								[key]: value,
						  }
						: acc;
				}
			}, {} as T);
		}
		return data;
	}

	public stringify(data: unknown, indent = 2): string {
		const cache: unknown[] = [];
		return JSON.stringify(
			data,
			(_key, value: unknown) =>
				typeof value === 'object' && value !== null
					? cache.includes(value)
						? undefined
						: cache.push(value) && value
					: value,
			indent,
		);
	}

	private isValid(data: unknown, options: OptionsInterface): boolean {
		if (options.undefined && data === undefined) {
			return false;
		} else if (options.null && data === null) {
			return false;
		} else if (options.emptyString && data === '') {
			return false;
		} else return !(options.zeroNumber && data === 0);
	}

	private isObject(data: unknown): boolean {
		if (data instanceof Date) {
			return false;
		} else if (data instanceof Object) {
			/**
			 * Check for mongoId instance
			 */
			return !data.toString().match(/^[0-9a-fA-F]{24}$/);
		} else if (data === null) {
			return false;
		}
		return typeof data === 'object';
	}
}

export const DataHelper = DataSingleton.getInstance();
