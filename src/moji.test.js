import test from 'ava';
import { lib as emojiDict } from 'emojilib';
import { prop } from 'ramda';

import search from './moji.js';

test('Moji search', t => {
  t.deepEqual(search('funny').map(prop('char')).sort(), ['😃', '😄'].sort());
  t.deepEqual(search('fist').map(prop('char')).sort(), ['👊', '✊'].sort());
  t.deepEqual(search('blah'), []);
  t.deepEqual(search('laugh').map(prop('char')).sort(), ['😄', '😅', '😆', '😆'].sort());
});

