const API_KEY = `cf94260c10934421b5ffd78d75671570`;
let newsList = [];
const menus = document.querySelectorAll('.menus button');
const searchInput = document.getElementById('search-input');

let url = new URL(
  `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`
);

menus.forEach((menu) =>
  menu.addEventListener('click', (event) => getNewsByCategory(event))
);

//pagination variables
let totalResults = 0;
let page = 1;
const pageSize = 10;
const groupSize = 5;

const getNews = async () => {
  try {
    url.searchParams.set('page', page);
    url.searchParams.set('pageSize', pageSize);
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    if (response.status === 200) {
      if (data.articles.length === 0) {
        throw new Error('No result for this search');
      }
      newsList = data.articles;
      totalResults = data.totalResults;
      render();
      renderPagination();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    renderError(error.message);
  }
};

const getLatestNews = async () => {
  url = new URL(
    `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`
  );
  getNews();
};

// const render = () => {
//   const newsHTML = newsList
//     .map((news) => {
//       const description = news.description ? news.description : '내용없음';
//       const truncatedDescription =
//         description.length > 200
//           ? `${description.substring(0, 200)}...`
//           : description;

//       return `
//           <div class="row news">
//             <div class="col-md-6 newsImage">
//               <img
//                 class="news-img-size img-fluid rounded"
//                 src=${
//                   news.urlToImage ? news.urlToImage : './assets/no-image.png'
//                 }
//                 alt="Responsive image"
//               />
//             </div>
//             <div class="col-md-6 description">
//               <h2 class="mt-1">${news.title}</h2>
//               <p>${truncatedDescription}</p>
//               <div>${
//                 news.source.name !== null ? news.source.name : 'No Source'
//               } * ${moment(news.publishedAt).fromNow()}</div>
//             </div>
//           </div>
//         `;
//     })
//     .join('');
//   document.getElementById('news-board').innerHTML = newsHTML;
// };

const render = () => {
  const newsHTML = newsList
    .map((news) => {
      const description = news.description ? news.description : '내용없음';
      const truncatedDescription =
        description.length > 200
          ? `${description.substring(0, 200)}...`
          : description;

      if (
        description === '[Removed]' ||
        news.title === '[Removed]' ||
        news.source.name === '[Removed]'
      ) {
        return `
          <div class="row news">
            <div class="col-md-6">
              <img class="news-img-size" src="./assets/no-image.png" alt="news image" />
            </div>
            <div class="col-md-6 mt-2 description">
              <h2 class="mt-1 removedMessage">삭제된 기사입니다.</h2>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="row news">
            <div class="col-md-6">
              <img
                class="news-img-size"
                src=${
                  news.urlToImage ? news.urlToImage : './assets/no-image.png'
                }
                alt="news image"
              />
            </div>
            <div class="col-md-6 description">
              <h2 class="mt-1">${news.title}</h2>
              <p>${truncatedDescription}</p>
              <div>${
                news.source.name !== null ? news.source.name : 'No Source'
              } * ${moment(news.publishedAt).fromNow()}</div>
            </div>
          </div>
        `;
      }
    })
    .join('');
  document.getElementById('news-board').innerHTML = newsHTML;
};

const renderError = (errorMessage) => {
  const errorHTML = `<div class="alert alert-danger" role="alert">
  ${errorMessage}
</div>`;

  document.getElementById('news-board').innerHTML = errorHTML;
};

const getNewsByCategory = async (event) => {
  const category = event.target.textContent.toLowerCase();
  url = new URL(
    `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`
  );
  getNews();
};

const getNewsByKeyword = async () => {
  const keyword = searchInput.value;
  url = new URL(
    `https://newsapi.org/v2/top-headlines?q=${keyword}&country=us&apiKey=${API_KEY}`
  );

  if (keyword === '') {
    alert('검색어를 입력해주세요');
    searchInput.value = '';
  } else {
    getNews();
  }
};

getLatestNews();

const moveToPage = (pageNumb) => {
  console.log('moveToPage', pageNumb);
  page = pageNumb;

  getNews();
};

const renderPagination = () => {
  const totalPage = Math.ceil(totalResults / pageSize);
  const pageGroup = Math.ceil(page / groupSize);
  let lastPage = pageGroup * groupSize;

  if (lastPage > totalPage) {
    lastPage = totalPage;
  }

  const firstPage =
    lastPage - (groupSize - 1) <= 0 ? 1 : lastPage - (groupSize - 1);

  let paginationHTML = '';

  if (page > 1) {
    paginationHTML += `
    <li class="page-item" onclick='moveToPage(1)'>
      <a class="page-link" aria-label="First">
        <span aria-hidden="true"><i class="fa-solid fa-angles-left"></i></span>
      </a>
    </li>`;
    paginationHTML += `
    <li class="page-item" onclick='moveToPage(${page - 1})'>
      <a class="page-link" aria-label="Previous">
        <span aria-hidden="true"><i class="fa-solid fa-angle-left"></i></span>
      </a>
    </li>`;
  }

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `<li class="page-item ${
      i === page ? 'active' : ''
    }" onclick="moveToPage(${i})"><a class="page-link">${i}</a></li>`;
  }

  if (page < totalPage) {
    paginationHTML += `
    <li class="page-item" onclick='moveToPage(${page + 1})'>
      <a class="page-link" aria-label="Next">
        <span aria-hidden="true"><i class="fa-solid fa-angle-right"></i></span>
      </a>
    </li>`;
    paginationHTML += `
    <li class="page-item" onclick='moveToPage(${totalPage})'>
      <a class="page-link" aria-label="Last">
        <span aria-hidden="true"><i class="fa-solid fa-angles-right"></i></span>
      </a>
    </li>`;
  }

  let last = pageGroup * 5;
  if (last > totalPage) {
    last = totalPage;
  }
  let first = last - 4 <= 0 ? 1 : last - 4;

  document.querySelector('.pagination').innerHTML = paginationHTML;
};

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  getNewsByKeyword();
  searchInput.value = '';
});

// 메뉴 클릭
let clickedButton;

const clickMenu = (event) => {
  if (clickedButton && clickedButton !== event.target) {
    clickedButton.classList.toggle('clicked');
  }
  event.target.classList.toggle('clicked');
  clickedButton = event.target;
};

const buttons = document.querySelectorAll('.menus button');

buttons.forEach((button) =>
  button.addEventListener('click', (e) => clickMenu(e))
);
