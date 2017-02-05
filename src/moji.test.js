import test from 'ava';
import { lib as emojiDict } from 'emojilib';
import { prop } from 'ramda';

import search from './moji.js';

test('Moji search', t => {
  t.deepEqual(search('funny').map(prop('char')), ['😃', '😄']);
  t.deepEqual(search('fist'), [emojiDict.fist, emojiDict.facepunch]);
  t.deepEqual(search('blah'), []);
  t.deepEqual(search('laugh').map(prop('char')), ['😄', '😅', '😆', '😆']);
});

