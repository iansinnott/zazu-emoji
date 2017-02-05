const fs = require('fs');
const path = require('path');
const emojiDict = require('emojilib').lib;
const emojiKeys = require('emojilib').ordered;
const R = require('ramda');
const debug = require('debug')('zazu-emoji:buildKeywordIndex');
const { IO } = require('shirt');

// Having the full output of the emoji lib is helpf for debugging
if (process.env.DEBUG) {
  IO(() => [emojiKeys, emojiDict])
    .map(R.map(x => JSON.stringify(x, null, 2)))
    .fold(debug, ([keys, dict]) => {
      fs.writeFileSync(path.resolve(__dirname, 'keys.json'), keys, { encoding: 'utf8' });
      fs.writeFileSync(path.resolve(__dirname, 'dict.json'), dict, { encoding: 'utf8' });
    });
}

/**
 * Turn into one large map of keywords to arrays All possible keywords, in a
 * list
 *
 * NOTE: This is important. If the keyword itself is in the dictionary then we
 * want to add it to its own list of matching keywowrds. Otherwise we end up
 * with an odd situation where you get things like "cat": []. Where a keyword
 * maps to nothing, even though it is itself a valid emoji
 */
const keywordsToInitialDict = R.compose(
  R.fromPairs,
  R.tap(debug),
  R.map(keyword => [keyword, (emojiDict[keyword] ? [keyword] : [])]) // See NOTE
);

const combineUniqueKeywords = R.compose(
  keywordsToInitialDict,
  R.uniq,
  R.flatten,
  R.map(([key, entry]) => entry.keywords.concat(key)), // Gimme dem keywords + keys
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

