//

const API_KEY = `cf94260c10934421b5ffd78d75671570`;

const getLatestNews = async () => {
  const url = new URL(
    `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`
  );
  const response = await fetch(url);
  console.log(response);
};

getLatestNews();
