// src/commands/fun/functions/wikipedia/cleanContent.js

module.exports = (content) => {
  return content
    .replace(/<\/?p[^>]*>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\n+/g, '\n')
    .trim();
};
