import './sass/main.scss';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY_PIXABAY = `27331775-d4865903e456a7e108fc4ea1d`;
const axios = require('axios').default;

async function getCarts(name) {
  const optionsSearch = `&q=${name}&image_type=photo&orientation=horizontal&safesearch=true`;
  const url = `https://pixabay.com/api/?key=${KEY_PIXABAY}${optionsSearch}`;
  console.log(url);
  try {
    const response = await axios.get(url);
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
  }
}

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
formEl.addEventListener('submit', onSearchPicture);
function onSearchPicture(event) {
  event.preventDefault();
  clearGallery();
  const searchQuery = event.currentTarget.elements.searchQuery.value.trim();
  console.log(searchQuery);
  getCarts(searchQuery).then(response => {
    const picturesArray = response.data.hits;
    console.log(picturesArray);
    const markup_cards = createCards(picturesArray);
    galleryEl.insertAdjacentHTML('beforeend', markup_cards);
    const lightbox = new SimpleLightbox('.gallery a', {});
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

// function fetchCountries(name) {
//   const optionsSearch = `&q=${name}&image_type=photo&orientation=horizontal&safesearch=true`;
//   const url = `https://pixabay.com/api/?key=${KEY_PIXABAY}${optionsSearch}`;
//   return fetch(url).then(response => {
//     if (!response.ok) {
//       throw new Error(response.status);
//     }
//     return response.json();
//   });
// }
// fetchCountries('cat')
//   .then(data => {
//     console.log(data);
//   })
//   .catch(error => {
//     console.log(error);
//   });
