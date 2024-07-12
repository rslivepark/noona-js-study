let newsList = [];
const menus = document.querySelectorAll('.menus button');
const searchInput = document.getElementById('search-input');
const inputClear = document.querySelector('.input-group > span');

const BASE_URL = `https://gorgeous-hamster-de6bab.netlify.app/top-headlines`;
let url = new URL(BASE_URL);

const pageSize = 10;
const groupSize = 5;
let totalResults = 0;
let page = 1;

let clickedButton;

// 뉴스 데이터 가져오기
const getNews = async () => {
  try {
    url.searchParams.set('page', page);
    url.searchParams.set('pageSize', pageSize);
    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 200) {
      if (data.articles.length === 0) {
        throw new Error('No result for this search');
      }
      newsList = data.articles;
      totalResults = data.totalResults;
      render();
      renderPagination();
      toggleSearchAndMenu(false);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    renderError(error.message);
  }
};

// 최신 뉴스 가져오기
const getLatestNews = async () => {
  url = new URL(BASE_URL);
  await getNews();
};

// 뉴스 렌더링
const render = () => {
  const newsHTML = newsList
    .map((news) => {
      if (isRemovedArticle(news)) {
        return renderRemovedArticle();
      }
      return renderNewsArticle(news);
    })
    .join('');
  document.getElementById('news-board').innerHTML = newsHTML;
};

const isRemovedArticle = (news) => {
  return (
    news.description === '[Removed]' ||
    news.title === '[Removed]' ||
    news.source.name === '[Removed]'
  );
};

const renderRemovedArticle = () => {
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
};

const renderNewsArticle = (news) => {
  const truncatedDescription = truncateDescription(news.description);
  return `
    <div class="row news">
      <div class="col-12 col-sm-12 col-md-6 col-lg-6">
        ${renderNewsImage(news.urlToImage)}
      </div>
      <div class="col-12 col-sm-12 col-md-6 col-lg-6 description">
        <h2 class="news-title"><a href="${
          news.url
        }" target="blank" title="클릭하면 전체 기사를 볼 수 있습니다.">${
    news.title
  }</a></h2>
        <p class="news-description">${truncatedDescription}</p>
        <div>
          <span class="news-source">${news.source.name || 'No Source'}</span>
          <span> * </span>
          <span class="news-time">${moment(news.publishedAt).fromNow()}</span>
        </div>
      </div>
    </div>
  `;
};

const truncateDescription = (description) => {
  const desc = description || '내용없음';
  return desc.length > 200 ? `${desc.substring(0, 200)}...` : desc;
};

const renderNewsImage = (urlToImage) => {
  if (urlToImage) {
    return `
      <a href="${urlToImage}" target="blank">
        <img
          class="news-img-size mt-1"
          src="${urlToImage}"
          alt="news image"
          onerror="this.onerror=null;this.src='./assets/no-image.png';"
          title="클릭하면 전체 이미지를 볼 수 있습니다."
        />
      </a>
    `;
  }
  return `
    <img
      class="news-img-size mt-1"
      src="./assets/no-image.png"
      alt="news image"
      title="이미지가 없습니다."
    />
  `;
};

// 에러 메시지 렌더링
const renderError = (errorMessage) => {
  const errorHTML = `<div class="alert alert-danger" role="alert">${errorMessage}</div>`;
  document.getElementById('news-board').innerHTML = errorHTML;
};

let isCategoryView = false;

const toggleSearchAndMenu = (isVisible) => {
  const searchInput = document.querySelector('.search');
  const menus = document.querySelector('.menus');

  if (window.innerWidth < 540) {
    searchInput.classList.toggle('search-clicked', isVisible);
    menus.classList.toggle('menu-clicked', isVisible);
  } else {
    searchInput.classList.remove('search-clicked');
    menus.classList.remove('menu-clicked');
  }
};

window.addEventListener('resize', () => toggleSearchAndMenu(isCategoryView));

// 카테고리별 뉴스 가져오기
const getNewsByCategory = async (event) => {
  const category = event.target.textContent.toLowerCase();
  url = new URL(`${BASE_URL}?category=${category}`);
  isCategoryView = true;
  await getNews();
  toggleSearchAndMenu(true);
};

// 키워드로 뉴스 검색
const getNewsByKeyword = async () => {
  const keyword = searchInput.value.trim();
  if (!keyword) {
    alert('검색어를 입력해주세요');
    searchInput.focus();
    return;
  }

  url = new URL(`${BASE_URL}?q=${keyword}`);
  isCategoryView = false;
  await getNews();
  searchInput.value = '';
  toggleSearchAndMenu(false);
};

// 페이지 이동
const moveToPage = (pageNum) => {
  page = pageNum;
  getNews();
};

// 페이지네이션 렌더링
const renderPagination = () => {
  const totalPage = Math.ceil(totalResults / pageSize);
  const pageGroup = Math.ceil(page / groupSize);
  let lastPage = Math.min(pageGroup * groupSize, totalPage);
  let firstPage = Math.max(lastPage - (groupSize - 1), 1);

  let paginationHTML = '';

  if (page > 1) {
    paginationHTML += renderPaginationButton(1, 'First', 'fa-angles-left');
    paginationHTML += renderPaginationButton(
      page - 1,
      'Previous',
      'fa-angle-left'
    );
  }

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `<li class="page-item ${
      i === page ? 'active' : ''
    }" onclick="moveToPage(${i})"><a class="page-link">${i}</a></li>`;
  }

  if (page < totalPage) {
    paginationHTML += renderPaginationButton(
      page + 1,
      'Next',
      'fa-angle-right'
    );
    paginationHTML += renderPaginationButton(
      totalPage,
      'Last',
      'fa-angles-right'
    );
  }

  document.querySelector('.pagination').innerHTML = paginationHTML;
};

const renderPaginationButton = (pageNum, label, iconClass) => {
  return `
    <li class="page-item" onclick='moveToPage(${pageNum})'>
      <a class="page-link" aria-label="${label}">
        <span aria-hidden="true"><i class="fa-solid ${iconClass}"></i></span>
      </a>
    </li>`;
};

// 초기화 함수
document.addEventListener('DOMContentLoaded', () => {
  menus.forEach((menu) =>
    menu.addEventListener('click', (event) => getNewsByCategory(event))
  );

  // 검색 폼 제출 이벤트
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    getNewsByKeyword();
  });

  // 메뉴 클릭 상태 관리
  document
    .querySelectorAll('.menus button')
    .forEach((button) => button.addEventListener('click', clickMenu));

  // 메뉴바 클릭 이벤트
  document.querySelector('.menu-bars').addEventListener('click', showMenu);

  // 스크롤 기능
  document.querySelector('.top').addEventListener('click', () => scrollTo(0));
  document
    .querySelector('.bottom')
    .addEventListener('click', () => scrollTo(document.body.scrollHeight));

  // 창 크기 감지
  window.addEventListener('resize', checkWindowSize);
  checkWindowSize();

  // 다크모드 초기화
  initDarkMode();

  // input clear 초기화
  initInputClear();

  // 페이지 로드 시 최신 뉴스 가져오기
  getLatestNews();
});

const clickMenu = (event) => {
  if (clickedButton && clickedButton !== event.target) {
    clickedButton.classList.remove('clicked');
  }
  event.target.classList.toggle('clicked');
  clickedButton = event.target;
};

const showMenu = () => {
  const searchInput = document.querySelector('.search');
  const menus = document.querySelector('.menus');

  searchInput.classList.toggle('search-clicked');
  menus.classList.toggle('menu-clicked');
};

// 스크롤 기능
const scrollTo = (position) => {
  window.scrollTo({
    top: position,
    behavior: 'smooth',
  });
};

// 창 크기 감지
const checkWindowSize = () => {
  const alertElement = document.querySelector('.window-alert');
  const originalContent = document.body.querySelector('section.container');

  if (window.innerWidth < 400) {
    if (!alertElement) {
      const newAlertElement = document.createElement('h2');
      newAlertElement.className = 'window-alert';
      newAlertElement.textContent = '브라우저 창 너비가 너무 작습니다.';
      document.body.appendChild(newAlertElement);
    }
    originalContent.style.display = 'none';
  } else {
    if (alertElement) {
      alertElement.remove();
    }
    originalContent.style.display = 'block';
  }
};

// 다크모드
const initDarkMode = () => {
  const button = document.getElementById('modeToggle');
  let darkMode = localStorage.getItem('darkMode') === 'enabled';

  const updateDarkMode = () => {
    document.body.classList.toggle('dark', darkMode);
    button.innerHTML = darkMode
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
  };

  button.addEventListener('click', () => {
    darkMode = !darkMode;
    updateDarkMode();
  });

  updateDarkMode();
};

// input clear
const initInputClear = () => {
  const inputField = document.getElementById('search-input');
  const clearButton = document.getElementById('clear-button');

  const toggleClearButton = () => {
    const isInputEmpty = inputField.value.length === 0;
    clearButton.classList.toggle('hidden', isInputEmpty);
    clearButton.classList.toggle('visible', !isInputEmpty);
  };

  inputField.addEventListener('input', toggleClearButton);

  clearButton.addEventListener('click', () => {
    inputField.value = '';
    toggleClearButton();
    inputField.focus();
  });

  toggleClearButton();
};
