const axios = require('axios');

const wikipediaAPI = 'https://en.wikipedia.org/w/api.php';

function cleanContent(text) {
  // Basic cleanup if needed; adjust if you want more
  return text.replace(/\s+/g, ' ').trim();
}

module.exports = async (userMessage) => {
  try {
    const { data } = await axios.get(wikipediaAPI, {
      params: {
        action: 'query',
        format: 'json',
        prop: 'extracts',
        exintro: true,
        explaintext: true,
        redirects: true,
        titles: userMessage,
      },
    });

    let page = data.query.pages[Object.keys(data.query.pages)[0]];

    // 🧠 Updated logic for intelligent suggestion
    if (!page || !page.extract) {
      const searchResponse = await axios.get(wikipediaAPI, {
        params: {
          action: 'query',
          format: 'json',
          list: 'search',
          srsearch: userMessage,
          srlimit: 1,
        },
      });

      const searchResults = searchResponse.data.query.search;

      if (searchResults.length > 0) {
        const suggestedTitle = searchResults[0].title;

        const suggestionData = await axios.get(wikipediaAPI, {
          params: {
            action: 'query',
            format: 'json',
            prop: 'extracts',
            exintro: true,
            explaintext: true,
            redirects: true,
            titles: suggestedTitle,
          },
        });

        const suggestionPage = suggestionData.data.query.pages[Object.keys(suggestionData.data.query.pages)[0]];

        if (suggestionPage && suggestionPage.extract) {
          suggestionPage.extract = cleanContent(suggestionPage.extract);
          return suggestionPage;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    // Clean and return valid page
    page.extract = cleanContent(page.extract);
    return page;

  } catch (error) {
    console.error('Wikipedia API Error:', error);
    throw new Error('Error fetching Wikipedia data');
  }
};