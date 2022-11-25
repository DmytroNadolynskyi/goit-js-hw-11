import { PixabayApi } from "./fetchImages";
import HBSGallery from "./gallery.hbs";
import {Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const searchBtn = document.querySelector('.submit-btn');
const input = document.querySelector('input')
const scroll = document.querySelector('.js-target-scroll')


const simpleLightbox = new SimpleLightbox('.photo-card a', {
  captionDelay: 250,
});


const  callback = async (entries,observer) => {
    if (entries[0].isIntersecting) {
        pixabayApi.page += 1;
        pixabayApi.per_page = '12';
    try {
      const searchResult = await pixabayApi.fetchImages()
      const imagesArr = searchResult.data.hits;         
      gallery.insertAdjacentHTML('beforeend', HBSGallery(imagesArr));
      simpleLightbox.refresh();
    //   slowScroll();
      if(Math.ceil(searchResult.data.totalHits / pixabayApi.per_page) < pixabayApi.page) {
        // loadMoreBtn.classList.add('is-hidden');
           observer.unobserve(scroll)
        Notify.info("'We're sorry, but you've reached the end of search results.")
      }
    } catch (err) {
        console.log(err)
    }
    }
}

const options = {
    root: null,
    rootMargin: '0px 0px 700px 0px ',
    threshold: 1.0
}

const observer = new IntersectionObserver(callback, options);

const pixabayApi = new PixabayApi()

searchForm.addEventListener('submit', onSearchFormSubmit);
// loadMoreBtn.addEventListener('click', onLoadMoreSubmit)

async function onSearchFormSubmit(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');
  pixabayApi.page = 1;
  pixabayApi.searchQuery = event.target.elements.searchQuery.value.trim();

  if(!pixabayApi.searchQuery) {
    Notify.failure('Enter the keyword, please');
    return;
  }

  try{    
    const searchResult = await pixabayApi.fetchImages()
    const imagesArr = searchResult.data.hits;    
    
    if (imagesArr.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.')
      throw new Error("Limit error");
    }

    gallery.innerHTML = HBSGallery(imagesArr);
    simpleLightbox.refresh();
   Notify.info(`Hooray! We found ${searchResult.data.totalHits} images.`)
    if(searchResult.data.totalHits > pixabayApi.per_page) {
    //   loadMoreBtn.classList.remove('is-hidden');
        observer.observe(scroll)
    }
    searchBtn.disabled = false;
  } catch (err) {
      console.log(err)
  }
  
  input.value = '';
}

// async function onLoadMoreSubmit () {
//   pixabayApi.page += 1;
  
//     try {
//       const searchResult = await pixabayApi.fetchImages()
//       const imagesArr = searchResult.data.hits;         
//       gallery.insertAdjacentHTML('beforeend', HBSGallery(imagesArr));
//       simpleLightbox.refresh();
//       slowScroll();
//       if(Math.ceil(searchResult.data.totalHits / pixabayApi.per_page) < pixabayApi.page) {
//         loadMoreBtn.classList.add('is-hidden');
//         Notify.info("'We're sorry, but you've reached the end of search results.")
//       }
//     } catch (err) {
//         console.log(err)
//     }
// }

// function slowScroll () {
//   const { height: cardHeight } = document
//   .querySelector(".gallery")
//   .firstElementChild.getBoundingClientRect();
//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: "smooth",
//   });
// }
