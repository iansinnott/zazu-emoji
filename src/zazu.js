// NOTE: We limit the number of results because its' a rendering bottleneck.
// Computation time seems fine, but the UI really doesn't render hundreds of
// rapidly changing lists well
const search = require('./moji.js')({ limit: 20 });

/**
 * Map a raw entry from the emojilib to a zazu entry for display
 */
const fromRaw = ({ char, name }) => ({
  id: char, // Does this work? Just using the emoji itself as an id?
  icon: char, // Emoji img. Passing char directly doesn't seem to work
  title: `${char} ${name}`, // Official emoji title
  subtitle: `Copy "${char}" to clipboard`,
  value: char, // Emoji
});

module.exports = (pluginContext) => {
  return (query, env = {}) => {
    return new Promise((resolve, reject) => {
      resolve(search(query).map(fromRaw));
    });
  };
};
