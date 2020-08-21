const test = require('ava')
const hello = require('../src/hello')

test('hello', (t) => {
  const result = hello('Daniel')
  t.is(result, 'Hello Daniel!')
})
