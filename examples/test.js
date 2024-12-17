function foo(callback) {
  setTimeout(() => {
    callback('FOO');
  }, 101);
}

function bar(callback) {
  setTimeout(() => {
    callback('BAR');
  }, 100);
}

function xxx(callback) {
  setTimeout(() => {
    callback('XXX');
  }, 102);
}

const fooPromise = new Promise((resolve) => {
  foo(resolve);
});
const barPromise = new Promise((resolve) => {
  bar(resolve);
});
const xxxPromise = new Promise((resolve) => {
  xxx(resolve);
});

// Sequential execution function
async function executeSequentially() {
  const result = [];
  result.push(await fooPromise);
  result.push(await barPromise);
  result.push(await xxxPromise);
  return result.join(' ');
}

(async function fooAsync() {
  const res = await executeSequentially();
  console.log(res);
})();
