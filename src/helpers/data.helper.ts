import { ObjectId } from 'mongodb';

class DataHelper {
  private static self: DataHelper;

  public static getInstance(): DataHelper {
    if (!DataHelper.self) {
      DataHelper.self = new DataHelper();
    }
    return DataHelper.self;
  }

  public filterUndefined<T>(data: T): T {
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
      return <T>data
        .filter((record) => {
          return record !== undefined;
        })
        .map((item) => {
          return this.filterUndefined(item);
        });
    }
    if (typeof data === 'object') {
      return <T>Object.entries(data as Record<string, unknown>)
        .filter(([, record]) => {
          return record !== undefined;
        })
        .reduce((acc, [key, value]) => {
          if (typeof value === 'object') {
            return {
              ...acc,
              [key]: this.filterUndefined(value),
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
}

export const FaData = DataHelper.getInstance();
