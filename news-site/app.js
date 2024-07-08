// API 키와 URL 설정
let newsList = [];
const menus = document.querySelectorAll('.menus button');
const searchInput = document.getElementById('search-input');

let url = new URL(
  `http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines`
);

// 카테고리 버튼 클릭 이벤트
menus.forEach((menu) =>
  menu.addEventListener('click', (event) => getNewsByCategory(event))
);

// 페이지네이션 변수 설정
let totalResults = 0;
let page = 1;
const pageSize = 10;
const groupSize = 5;

// 뉴스 데이터 가져오기
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

      const searchInput = document.querySelector('.search');
      const menus = document.querySelector('.menus');
      searchInput.classList.remove('search-clicked');
      menus.classList.remove('menu-clicked');
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    renderError(error.message);
  }
};

// 최신 뉴스 가져오기
const getLatestNews = async () => {
  url = new URL(
    `http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines`
  );
  getNews();
};

// 뉴스 렌더링
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
              <div class="col-12 col-sm-12 col-md-6 col-lg-6">
                <img class="news-img-size mt-1" src="./assets/no-image.png" alt="news image" />
              </div>
              <div class="col-12 col-sm-12 col-md-6 col-lg-6 description">
                <h2 class="news-title removedMessage">삭제된 기사입니다.</h2>
              </div>
            </div>
          `;
      } else {
        return `
            <div class="row news">
              <div class="col-12 col-sm-12 col-md-6 col-lg-6">
                ${
                  news.urlToImage
                    ? `<a href="${news.urlToImage}" target="blank">
                        <img
                          class="news-img-size mt-1"
                          src="${news.urlToImage}"
                          alt="news image"
                          onerror="this.onerror=null;this.src='./assets/no-image.png';"
                          title="클릭하면 전체 이미지를 볼 수 있습니다."
                        />
                      </a>`
                    : `<img
                        class="news-img-size mt-1"
                        src="./assets/no-image.png"
                        alt="news image"
                        title="이미지가 없습니다."
                      />`
                }
              </div>
              <div class="col-12 col-sm-12 col-md-6 col-lg-6 description">
                <h2 class="news-title"><a href="${
                  news.url
                }" target="blank" title="클릭하면 전체 기사를 볼 수 있습니다.">${
          news.title
        }</a></h2>
                <p class="news-description">${truncatedDescription}</p>
                <div>
                <span class="news-source">${
                  news.source.name !== null ? news.source.name : 'No Source'
                }</span><span> * </span><span class="news-time">${moment(
          news.publishedAt
        ).fromNow()}</span></div>
              </div>
            </div>
          `;
      }
    })
    .join('');
  document.getElementById('news-board').innerHTML = newsHTML;
};

// 에러 메시지 렌더링
const renderError = (errorMessage) => {
  const errorHTML = `<div class="alert alert-danger" role="alert">
    ${errorMessage}
  </div>`;

  document.getElementById('news-board').innerHTML = errorHTML;
};

let isCategoryView = false;

const toggleMenuDisplay = () => {
  const searchInput = document.querySelector('.search');
  const menus = document.querySelector('.menus');

  if (window.innerWidth < 540) {
    if (!isCategoryView) {
      searchInput.classList.remove('search-clicked');
      menus.classList.remove('menu-clicked');
    } else {
      searchInput.classList.add('search-clicked');
      menus.classList.add('menu-clicked');
    }
  } else {
    searchInput.classList.remove('search-clicked');
    menus.classList.remove('menu-clicked');
  }
};

window.addEventListener('resize', toggleMenuDisplay);

// 카테고리별 뉴스 가져오기
const getNewsByCategory = async (event) => {
  const category = event.target.textContent.toLowerCase();
  url = new URL(
    `http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines?category=${category}`
  );
  isCategoryView = true;
  await getNews();
  toggleMenuDisplay();
};

// 키워드로 뉴스 검색
const getNewsByKeyword = async () => {
  const keyword = searchInput.value;
  url = new URL(
    `http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines?q=${keyword}`
  );

  if (keyword === '') {
    alert('검색어를 입력해주세요');
    searchInput.focus();
    searchInput.value = '';
  } else {
    isCategoryView = false;
    await getNews();
    searchInput.value = '';
    toggleMenuDisplay();
  }
};

getLatestNews();

// 페이지 이동
const moveToPage = (pageNumb) => {
  console.log('moveToPage', pageNumb);
  page = pageNumb;

  getNews();
};

// 페이지네이션 렌더링
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

// 검색 폼 제출 이벤트
document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  getNewsByKeyword();
  searchInput.value = '';
});

// 메뉴 클릭 상태 관리
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

// 메뉴바 클릭 이벤트
const showMenu = () => {
  const searchInput = document.querySelector('.search');
  const menus = document.querySelector('.menus');

  searchInput.classList.toggle('search-clicked');
  menus.classList.toggle('menu-clicked');
};

document.querySelector('.menu-bars').addEventListener('click', showMenu);

// 위로가기 및 아래로가기
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
};

document.querySelector('.top').addEventListener('click', scrollToTop);
document.querySelector('.bottom').addEventListener('click', scrollToBottom);

// 창 크기 감지
const originalContent = document.body.querySelector('section.container');

function checkWindowSize() {
  if (window.innerWidth < 400) {
    if (!document.querySelector('.window-alert')) {
      const alertElement = document.createElement('h2');
      alertElement.className = 'window-alert';
      alertElement.textContent = '브라우저 창 너비가 너무 작습니다.';
      document.body.appendChild(alertElement);
      originalContent.style.display = 'none';
    }
  } else {
    const alertElement = document.querySelector('.window-alert');
    if (alertElement) {
      alertElement.remove();
      originalContent.style.display = 'block';
    }
  }
}

window.addEventListener('resize', checkWindowSize);

checkWindowSize();

// 다크모드
const button = document.getElementById('modeToggle');
button.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('darkMode', 'enabled');
    button.innerHTML = `<i class="fa-solid fa-sun"></i>`;
  } else {
    localStorage.setItem('darkMode', null);
    button.innerHTML = `<i class="fa-solid fa-moon"></i>`;
  }
});

const enableDarkMode = () => {
  document.body.classList.add('dark');
  button.innerHTML = `<i class="fa-solid fa-sun"></i>`;
};

const disableDarkMode = () => {
  document.body.classList.remove('dark');
  button.innerHTML = `<i class="fa-solid fa-moon"></i>`;
};

const darkMode = localStorage.getItem('darkMode');

if (darkMode === 'enabled') {
  enableDarkMode();
}
