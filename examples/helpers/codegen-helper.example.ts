import { CodegenHelper } from '../../src';

export function CodegenHelperExample(): void {
  console.clear();
  const name = 'lorem ipsum';
  const message = 'dolor sit amet';
  CodegenHelper.message(name, message);
  CodegenHelper.success(name, message);
  CodegenHelper.error(name, message, new Error('Custom error'));
}
