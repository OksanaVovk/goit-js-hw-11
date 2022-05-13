export default class NewsApiServise {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.isLoading = false;
    this.shouldLoad = true;
  }
  async getCarts() {
    const axios = require('axios').default;
    const KEY_PIXABAY = `27331775-d4865903e456a7e108fc4ea1d`;
    const pagination = `&per_page=40&page=${this.page}`;
    const optionsSearch = `&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true`;
    const url = `https://pixabay.com/api/?key=${KEY_PIXABAY}${optionsSearch}${pagination}`;
    console.log(url);
    try {
      const response = await axios.get(url);
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }

  resetPage() {
    this.page = 1;
  }

  incrementPage() {
    this.page += 1;
  }

  resetIsLoading() {
    this.isLoading = false;
  }

  reswrtShouldLoad() {
    this.shouldLoad = true;
  }
}
