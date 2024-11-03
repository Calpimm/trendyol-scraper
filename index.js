import axios from 'axios';

export const getData = async (link) => {
  try {
    const response = await axios.get(link);
    const match = response.data.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!match) {
      throw new Error('No match found');
    }
    var result = JSON.parse(match[1].replace(/@/g, "").replace(/https:\/\/schema\.org\//g, ""));

    delete result.context;
    result.image = result.image?.[0]?.split(',') || [];

    return result;
  } catch (error) {
    return error;
  }
};

// Test case
(async () => {
  const link = 'https://www.watsons.com.tr/nyx-professional-makeup-buttermelt-blush-kremsi-pudra-allik-04-u-know-butta/p/BP_1406335'; // Replace with a valid URL
  const data = await getData(link);
  console.log(data);
})();
