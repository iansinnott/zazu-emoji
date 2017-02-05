module.exports = (pluginContext) => {
  return (name, env = {}) => {
    return new Promise((resolve, reject) => {
      const char = '💩';
      resolve([
        {
          id: char, // Does this work? Just using the emoji itself as an id?
          icon: char, // Emoji img. Passing char directly doesn't seem to work
          title: `Your moji is ${char}!`, // Official emoji title
          subtitle: `Copy "${char}" to clipboard`,
          value: char, // Emoji
        },
      ]);
    });
  };
};
