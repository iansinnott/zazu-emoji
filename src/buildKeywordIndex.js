const fs = require('fs');
const path = require('path');
const emojiDict = require('emojilib').lib;
const R = require('ramda');
const debug = require('debug')('zazu-emoji:buildKeywordIndex');
const { IO } = require('shirt');

// Turn into one large map of keywords to arrays
// All possible keywords, in a list
const keywordsToInitialDict = R.compose(
  R.fromPairs,
  R.map(keyword =>
    IO(() => !!emojiDict[keyword])
      .map(x => (x ? Right(true) : Left(false)))
      .map(R.tap(debug))
      .fold(R.always([keyword, []]), R.always([keyword, [keyword]])))
);

const combineUniqueKeywords = R.compose(
  keywordsToInitialDict,
  R.uniq, // Uniqify everything
  R.chain(([key, entry]) => entry.keywords.concat(key)), // Gimme dem keywords + keys
  R.toPairs
);

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
    keywordMap[keyword].push(id);
    return keywordMap;
  }, keywordMap);
};

const allKeywords = IO.of(emojiDict)
  .map(combineUniqueKeywords)
  .chain(keywords =>
    IO.of(emojiDict)
      .map(R.keys)
      .map(R.map(k => [k, R.path([k, 'keywords'], emojiDict)]))
      .map(R.reduce(fillKnownKeywords, keywords)));

allKeywords
  .map(data => JSON.stringify(data, null, 2))
  .map(data => [path.resolve(__dirname, 'keywordIndex.json'), data])
  .fold(
    err => {
      const message = `Could not write to ${path.resolve(__dirname, 'keywordIndex.json')}`;
      debug(message, err);
      console.log(message);
      process.exitCode = 1;
    },
    ([ writePath, data ]) => {
      fs.writeFileSync(writePath, data, { encoding: 'utf8' });
    }
  );

