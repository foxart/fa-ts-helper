function testParser(): void {
  const data = 'Hello World';
  console.log(data, data);
  // console.info([data, data]);
  // console.error(new Error('My Error'));
  // console.debug('Hello World!', 123, new Error('Debug Error'));
  // console.warn({ a: data, b: 'lorem ipsum', c: [{ a: data }] });
}

void (function (): void {
  console.clear();
  testParser();
})();
