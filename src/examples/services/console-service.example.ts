import { DataHelper } from '../../helpers/data.helper';
import { ErrorClass } from '../../classes/error.class';

export function run(): void {
  try {
    // @ts-ignore
    data = 1;
  } catch (e) {
    // console.log(e);
  }
  // console.log(new ErrorService('simple sting'));
  // console.log(
  //   new ErrorService({
  //     name: 'ErrorServiceName',
  //     message: { a: 1 },
  //     status: 500,
  //   }),
  // );
  const data = { key1: { key11: {}, key12: { key121: 1 } }, key2: {} };
  const result = DataHelper.filter(data, { emptyObject: true, recursive: false });
  console.log(result);
}
