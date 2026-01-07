import axios from "axios";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const retryFetch = async (url, retries = 3, delay = 1000) => {
  try {
    return await axios.get(url);
  } catch (err) {
    if (retries === 0) throw err;

    console.warn(
      `Fetch failed for ${url}. Retrying in ${delay}ms`
    );

    await sleep(delay);
    return retryFetch(url, retries - 1, delay * 2);
  }
};
