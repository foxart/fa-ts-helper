class SystemHelper {
	private static self: SystemHelper;

	public static getInstance(): SystemHelper {
		if (!SystemHelper.self) {
			SystemHelper.self = new SystemHelper();
		}
		return SystemHelper.self;
	}

	public sleep(ms: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout((): void => {
				resolve();
			}, ms);
		});
	}
}

export const FaSystem = SystemHelper.getInstance();
