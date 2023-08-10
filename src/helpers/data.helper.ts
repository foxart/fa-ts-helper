import { ObjectId } from 'mongodb';

function filterUndefined(data: unknown): unknown {
	if (data === null) {
		return data;
	}
	if (data instanceof Date) {
		return data;
	}
	if (ObjectId.isValid(data as ObjectId)) {
		return data;
	}
	if (Array.isArray(data)) {
		return data
			.filter((record) => {
				return record !== undefined;
			})
			.map((item) => {
				return filterUndefined(item);
			});
	}
	if (typeof data === 'object') {
		return Object.entries(data as Record<string, unknown>)
			.filter(([, record]) => {
				return record !== undefined;
			})
			.reduce((acc, [key, value]) => {
				if (typeof value === 'object') {
					return {
						...acc,
						[key]: filterUndefined(value),
					};
				} else {
					return {
						...acc,
						[key]: value,
					};
				}
			}, {});
	}
	return data;
}

export const DataHelper = {
	filterUndefined,
};
