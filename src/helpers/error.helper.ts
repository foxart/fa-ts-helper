export interface ErrorHelperInterface {
	name: string;
	message: string;
	response?: string | object;
	status?: number;
}

export class ErrorHelper extends Error {
	private readonly response: string | object;
	private readonly status: number;

	public constructor(error: string | ErrorHelperInterface) {
		super();
		if (typeof error === 'string') {
			this.name = ErrorHelper.name;
			this.message = error;
			this.response = {};
			this.status = 500;
		} else {
			this.name = error.name;
			this.message = error.message;
			this.response = error.response || {};
			this.status = error.status || 500;
		}
	}

	public getResponse(): string | object {
		return this.response;
	}

	public getStatus(): number {
		return this.status;
	}
}
