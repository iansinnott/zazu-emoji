const emojiDict = require('emojilib').lib;
const R = require('ramda');
const debug = require('debug')('zazu-emoji:moji');
const { IO } = require('shirt');

const keywordIndex = require('./keywordIndex.json');

const DEFAULT_LIMIT = 250;

// console.log(
//   R.compose(
//     R.head,
//     R.sort((a, b) => b-a),
//     R.map(arr => arr.length),
//     R.values
//   )(keywordIndex)
// );

/**
 * The actual search. This is the meat of what translates user input into
 * keywords to be looked up via the keyword index. This could be more advanced
 * (fuzzy matching) but for now this will do.
 */
const search = (query) => R.filter(x => x.includes(query));

const searchByQuery = R.curry((opts, query) =>
  IO.of(keywordIndex)
    .map(Object.keys) // We will match against keys on the index
    .map(search(query)) // The actual search
    .map(R.chain(x => keywordIndex[x])) // Each key to its list of emoji names
    .map(R.take(opts.limit || DEFAULT_LIMIT)) // Limit the number returned
    .map(R.map(x => Object.assign({}, { name: x }, emojiDict[x])))
    .fold(debug, x => x));

module.exports = searchByQuery;
