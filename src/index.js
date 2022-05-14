import './sass/main.scss';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import NewsApiServise from './NewsApiServise';
import throttle from 'lodash.throttle';

const newsApiServise = new NewsApiServise();
const lightbox = new SimpleLightbox('.gallery a', {});

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadmoreBtn = document.querySelector('.load-more');
const scrollBtn = document.querySelector('.scroll');
const forButtonBtn = document.querySelector('.button');

formEl.addEventListener('submit', onSearchPicture);
forButtonBtn.addEventListener('click', onForButton);
scrollBtn.addEventListener('click', onScrollBtn);
loadmoreBtn.addEventListener('click', onLoadMore);
forButtonBtn.classList.add('current');
loadmoreBtn.classList.add('visually-hidden');

function onScrollBtn() {
  forButtonBtn.classList.remove('current');
  scrollBtn.classList.add('current');
  window.addEventListener('scroll', throttle(checkPosition, 250));
  window.addEventListener('resize', throttle(checkPosition, 250));
  loadmoreBtn.classList.add('is-hidden');
}

function onForButton() {
  forButtonBtn.classList.add('current');
  loadmoreBtn.classList.remove('is-hidden');
  scrollBtn.classList.remove('current');
  loadmoreBtn.addEventListener('click', onLoadMore);
  window.removeEventListener('scroll', throttle(checkPosition, 250));
  window.removeEventListener('resize', throttle(checkPosition, 250));
}

function onSearchPicture(event) {
  event.preventDefault();
  clearGallery();
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
      loadmoreBtn.classList.toggle('visually-hidden');
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
    <div class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </div>
    <div class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </div>
    <div class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </div>
    <div class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </div>
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
      return Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        { timeout: 3000 },
      );
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
