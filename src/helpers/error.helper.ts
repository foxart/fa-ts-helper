import { DataHelper } from './data.helper';

interface ErrorHelperInterface {
	name: string;
	message: unknown;
	status?: number;
}

export class ErrorHelper extends Error {
	public readonly status: number;

	public constructor(error: string | Error | ErrorHelperInterface) {
		super();
		if (typeof error === 'string') {
			this.name = ErrorHelper.name;
			this.message = error;
			this.status = 500;
		} else if (error instanceof Error) {
			this.name = error.name;
			this.message = error.message;
			this.status = 500;
		} else {
			this.name = error.name;
			this.message = typeof error.message === 'string' ? error.message : DataHelper.stringify(error.message);
			this.status = error.status || 500;
		}
	}
}
