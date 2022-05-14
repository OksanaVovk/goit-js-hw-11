import './sass/main.scss';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import NewsApiServise from './NewsApiServise';
import throttle from 'lodash.throttle';

const newsApiServise = new NewsApiServise();
const lightbox = new SimpleLightbox('.gallery a', {});

const formEl = document.querySelector('.search-form');
const inputEl = document.querySelector('input');
const galleryEl = document.querySelector('.gallery');
const loadmoreBtn = document.querySelector('.load-more');
const forScrollBtn = document.querySelector('.scroll');
const forButtonBtn = document.querySelector('.button');

formEl.addEventListener('submit', onSearchPicture);

forButtonBtn.addEventListener('click', onForButton);
forScrollBtn.addEventListener('click', onForScrollBtn);
loadmoreBtn.addEventListener('click', onLoadMore);
loadmoreBtn.classList.add('visually-hidden');

function onForScrollBtn() {
  inputEl.value = '';
  clearGallery();
  loadmoreBtn.classList.add('is-hidden');
  window.addEventListener('scroll', throttle(checkPosition, 250));
  window.addEventListener('resize', throttle(checkPosition, 250));
}

function onForButton() {
  window.location.reload();
  loadmoreBtn.classList.remove('is-hidden');
  loadmoreBtn.classList.add('visually-hidden');
  loadmoreBtn.addEventListener('click', onLoadMore);
  window.removeEventListener('scroll', throttle(checkPosition, 250));
  window.removeEventListener('resize', throttle(checkPosition, 250));
}

function onSearchPicture(event) {
  event.preventDefault();
  clearGallery();
  loadmoreBtn.classList.add('visually-hidden');
  newsApiServise.resetIsLoading();
  newsApiServise.reswrtShouldLoad();
  newsApiServise.query = event.currentTarget.elements.searchQuery.value.trim();
  console.log(newsApiServise.searchQuery);
  newsApiServise.resetPage();
  newsApiServise.getCarts().then(response => {
    const picturesArray = response.data.hits;
    console.log(picturesArray);
    if (picturesArray.length === 0) {
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
    }
    const totalCards = response.data.totalHits;
    Notiflix.Notify.success(`Hooray! We found ${totalCards} images.`);
    const markup_cards = createCards(picturesArray);
    galleryEl.insertAdjacentHTML('beforeend', markup_cards);
    const cardsEl = document.querySelectorAll('.photo-card');
    if (cardsEl.length !== totalCards) {
      loadmoreBtn.classList.remove('visually-hidden');
    } else {
      newsApiServise.shouldLoad = false;
    }
  });
}

function createCards(data) {
  return data
    .map(({ likes, tags, views, downloads, comments, webformatURL, largeImageURL }) => {
      return `<div class="photo-card">
      <a class="gallery__item" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </p>
    </div>
  </div>
    `;
    })
    .join('');
}

function clearGallery() {
  galleryEl.innerHTML = '';
}

function onLoadMore() {
  if (newsApiServise.isLoading || !newsApiServise.shouldLoad)
    return (newsApiServise.isLoading = true);
  newsApiServise.incrementPage();
  newsApiServise.getCarts().then(response => {
    const picturesMoreArray = response.data.hits;
    console.log(picturesMoreArray);
    const markupMore_cards = createCards(picturesMoreArray);
    galleryEl.insertAdjacentHTML('beforeend', markupMore_cards);
    lightbox.refresh();
    const cardsEl = document.querySelectorAll('.photo-card');
    const totalCards = response.data.totalHits;
    console.dir(cardsEl);

    if (cardsEl.length >= totalCards) {
      newsApiServise.shouldLoad = false;
      loadmoreBtn.classList.add('visually-hidden');
      setTimeout(function () {
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          { timeout: 3000 },
        );
      }, 1000);
    }
  });
}

function checkPosition() {
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;

  const scrolled = window.scrollY;

  const threshold = height - screenHeight / 4;

  const position = scrolled + screenHeight;

  if (position >= threshold) {
    onLoadMore();
  }
}

// функція прокрутки вгору

$('.back-to-top').click(function () {
  $('body,html').animate({ scrollTop: 0 }, 800); // 800 - Скорость анимации
});

$(window).scroll(function () {
  // Отслеживаем начало прокрутки
  let scrolled = $(window).scrollTop(); // Вычисляем сколько было прокручено.

  if (scrolled > 350) {
    // Если высота прокрутки больше 350 - показываем кнопку
    $('.back-to-top').addClass('active');
  } else {
    $('.back-to-top').removeClass('active');
  }
});
