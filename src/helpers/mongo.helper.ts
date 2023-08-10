import { ObjectId } from 'mongodb';

interface UpdateResult {
	acknowledged: boolean;
	matchedCount: number;
	modifiedCount: number;
	upsertedCount: number;
	upsertedId: ObjectId | null;
}

interface DeleteResult {
	acknowledged: boolean;
	deletedCount: number;
}

function isUpdated(result: unknown, count = 1): boolean {
	return (
		(result as UpdateResult).acknowledged &&
		(result as UpdateResult).matchedCount === count &&
		(result as UpdateResult).modifiedCount === count
	);
}

function isDeleted(result: unknown, count = 1): boolean {
	return (result as DeleteResult).acknowledged && (result as DeleteResult).deletedCount === count;
}

export const MongoHelper = {
	isUpdated,
	isDeleted,
};
