import { ObjectId } from 'mongodb';

interface OptionsInterface {
	undefined?: boolean;
	null?: boolean;
	emptyString?: boolean;
	zeroNumber?: boolean;
}

class DataHelper {
	private static self: DataHelper;

	public static getInstance(): DataHelper {
		if (!DataHelper.self) {
			DataHelper.self = new DataHelper();
		}
		return DataHelper.self;
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

	private isValid(data: unknown, options: OptionsInterface): boolean {
		if (options.undefined && data === undefined) {
			return false;
		} else if (options.null && data === null) {
			return false;
		} else if (options.emptyString && data === '') {
			return false;
		} else if (options.zeroNumber && data === 0) {
			return false;
		} else {
			return true;
		}
	}

	private isObject(data: unknown): boolean {
		if (ObjectId.isValid(data as ObjectId)) {
			return false;
		} else if (data instanceof Date) {
			return false;
		} else if (data === null) {
			return false;
		}
		return typeof data === 'object';
	}
}

export const Data = DataHelper.getInstance();
