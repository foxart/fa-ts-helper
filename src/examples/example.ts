export function test(): void {
  console.clear();
  const myObject = { key: 'key' };
  const newMyObject = myObject.key;
  myObject.key = 'XXX';
  console.log({ keyDto: myObject.key, newKeyDto: newMyObject });
}

test();
