function sleep(ms: number): Promise<number> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const commonHelper = {
	sleep,
};
