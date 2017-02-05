const emojiDict = require('emojilib').lib;
const emojiKeys = require('emojilib').ordered;
const R = require('ramda');
const debug = require('debug')('zazu-emoji:moji');
const { IO } = require('shirt');

// Turn into one large map of keywords to empty arrays
// All possible keywords, in a list
const keywordsToInitialDict = R.compose(
  R.fromPairs,
  R.map(keyword => [keyword, []])
);

const combineUniqueKeywords = R.compose(
  keywordsToInitialDict,
  R.uniq, // Uniqify everything
  R.concat(R.keys(emojiDict)), // Bring in all keys from the emoji dict
  R.flatten, // Flatten arrays of keywords into one
  R.values, // Get array, since R.map Object -> Object
  R.map(R.prop('keywords')) // Gimme dem keywords
);

const reducer = (keywords, keys) => {
  return
}

/**
 * Keyword map is an object mapping every known keyword to an array of emoji
 * keys. The emoji key is just a known key that appears in the emoji lib. So,
 * in the end this gives us a mapping of every keyword (keywordMap) to an array
 * of all possible known emoji
 *
 * TODO: This is impure. Keyword map is mutated
 */
const fillKnownKeywords = (keywordMap, [id, list]) => {
  return list.reduce((keywordMap, keyword) => {
    keywordMap[keyword] = keywordMap[keyword].concat([id]);
    return keywordMap;
  }, keywordMap);
};

const allKeywords =
  IO.of(emojiDict)
    .map(combineUniqueKeywords)
    .chain(keywords =>
      IO.of(emojiDict)
        .map(R.keys)
        .map(R.map(k => [k, R.path([k, 'keywords'], emojiDict)]))
        .map(R.reduce(fillKnownKeywords, keywords)))
    .fold(debug, x => x);

// Want to combine this up into the logic above
// emojiKeys.forEach(emojiId => {
//   const kw = emojiDict[emojiId].keywords;
//
//   kw.reduce((agg, keyword) => {
//     agg[keyword] = agg[keyword].concat([emojiId]);
//     return agg;
//   }, allKeywords);
// });

module.exports = (query) => {
};

// console.log(allKeywords);

const filterByQuery = query => {
  return IO.of(allKeywords)
    .map(Object.keys)
    .map(R.filter(x => x.includes(query)))

  // each key to its list of emoji
    .map(R.map(x => allKeywords[x]))
    .map(R.flatten)
    .map(R.map(x => emojiDict[x]))
    .fold(debug, x => x);
};

console.log(
  filterByQuery(process.argv[2]).map(R.prop('char'))
);
