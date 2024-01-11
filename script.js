const api = axios.create({
    baseURL: 'https://tmdb-proxy.cubos-academy.workers.dev',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

let currentPage = 0;
const moviesPerPage = 6;
const totalMovies = 18;
let moviesData = [];

async function getData(name) {
    const response = await api.get(name);
    const data = response.data.results;
    return data.slice(0, totalMovies);
}

async function initialData(phrase) {
    moviesData = await getData(phrase);
    renderMovies(currentPage);
}

initialData('/3/discover/movie?language=pt-BR&include_adult=false');

function renderMovies(page) {
    const moviesContainer = document.querySelector('.movies');

    moviesContainer.innerHTML = '';

    const firstMovie = page * moviesPerPage;
    const lastMovie = firstMovie + moviesPerPage;
    const actualPageMovies = moviesData.slice(firstMovie, lastMovie);

    actualPageMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie');

        const movieInfo = document.createElement('div');
        movieInfo.classList.add('movie__info');

        const posterImageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieCard.style.backgroundImage = `url(${posterImageUrl})`;

        const titleElement = document.createElement('span');
        titleElement.classList.add('movie__title');
        titleElement.textContent = movie.title;

        const ratingElement = document.createElement('span');
        ratingElement.classList.add('movie__rating');
        ratingElement.textContent = movie.vote_average;

        const ratingImg = document.createElement('img');
        ratingImg.src = "./assets/estrela.svg";
        ratingImg.alt = "Estrela";

        moviesContainer.appendChild(movieCard);


        movieCard.appendChild(movieInfo);

        movieInfo.appendChild(titleElement);

        movieInfo.appendChild(ratingElement);

        ratingElement.appendChild(ratingImg);

        movieCard.id = movie.id;
        movieCard.addEventListener('click', clickcallback);

    });
}

const nextButton = document.querySelector('.btn-next');
const backButton = document.querySelector('.btn-prev');

nextButton.addEventListener('click', () => {
    if (currentPage === 2) {
        currentPage = 0;
    }
    else {
        currentPage++;
    }
    renderMovies(currentPage);
});

backButton.addEventListener('click', () => {
    if (currentPage === 0) {
        currentPage = 2;
    }
    else {
        currentPage--;
    }
    renderMovies(currentPage);
});

const inputMovieResearch = document.querySelector('.input');

inputMovieResearch.addEventListener('keypress', async (event) => {
    if (event.key === "Enter" && !inputMovieResearch.value) {
        currentPage = 0;
        renderMovies(currentPage);
        initialData('/3/discover/movie?language=pt-BR&include_adult=false');
    }
    else if (event.key === "Enter" && inputMovieResearch.value) {
        currentPage = 0;
        const response = await api.get(`/3/search/movie?language=pt-BR&include_adult=false&query=${inputMovieResearch.value}`);

        moviesData = response.data.results;
        renderMovies(currentPage);

        inputMovieResearch.value = '';
    }
});

async function getDayMovie() {
    const generalEndPoint = await api.get('/3/movie/436969?language=pt-BR');
    const videoEndPoint = await api.get('/3/movie/436969/videos?language=pt-BR');

    const highlightVideoLink = document.querySelector('.highlight__video-link');
    const highlightVideo = document.querySelector('.highlight__video');
    const highlightTitle = document.querySelector(".highlight__title");
    const highlightRating = document.querySelector(".highlight__rating");
    const highlightGenres = document.querySelector(".highlight__genres");
    const highlightLaunch = document.querySelector(".highlight__launch");
    const highlightDescription = document.querySelector(".highlight__description");

    highlightVideoLink.setAttribute('href', `https://www.youtube.com/watch?v=${videoEndPoint.data.results[0].key}`);

    const highlightPictureUrl = generalEndPoint.data.backdrop_path;

    highlightVideo.style.backgroundImage = `url(${highlightPictureUrl})`;
    highlightVideo.style.backgroundSize = 'contain';

    highlightTitle.textContent = generalEndPoint.data.title;

    highlightRating.textContent = generalEndPoint.data.vote_average;

    let genresOrganized = "";
    const highlightGenresReturn = generalEndPoint.data.genres;

    highlightGenresReturn.forEach((movieGenre) => {

        genresOrganized += movieGenre.name + ', ';

    })

    highlightGenres.textContent = genresOrganized;

    const currentDate = new Date(generalEndPoint.data.release_date);
    const formatedDate = currentDate.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });

    highlightLaunch.textContent = formatedDate;

    highlightDescription.textContent = generalEndPoint.data.overview;

}

getDayMovie();

const modal = document.querySelector('.modal', '.hidden');

async function clickcallback(event) {
    modal.classList.remove('hidden');
    const movieId = event.currentTarget.id;
    const movieUrl = await api.get(`/3/movie/${movieId}?language=pt-BR`);

    const modalTitle = document.querySelector('.modal__title');
    modalTitle.textContent = movieUrl.data.title;

    const modalImg = document.querySelector('.modal__img');
    modalImg.src = movieUrl.data.backdrop_path;

    const modalDescription = document.querySelector('.modal__description');
    modalDescription.textContent = movieUrl.data.overview;

    const modalAverage = document.querySelector('.modal__average');
    modalAverage.textContent = movieUrl.data.vote_average;

    const modalGenres = document.querySelector('.modal__genres');
    const modalGenresData = movieUrl.data.genres;

    modalGenres.innerHTML = '';

    modalGenresData.forEach((genre) => {

        const modalSpan = document.createElement("span");
        modalSpan.classList.add('modal__genre');
        modalSpan.textContent = genre.name;

        modalGenres.appendChild(modalSpan);
    })

};

modal.addEventListener('click', () => {
    modal.classList.add('hidden');
})

const btnTheme = document.querySelector('.btn-theme');
const root = document.querySelector(':root');
const logo = document.querySelector('.header__container-logo img');

btnTheme.addEventListener('click', () => {
    const result = root.style.getPropertyValue('--background') === '#1B2028';
    root.style.setProperty('--background', result ? '#fff' : '#1B2028');
    root.style.setProperty('--input-color', result ? '#979797' : '#ffffff');
    root.style.setProperty('--text-color', result ? '#1b2028' : '#ffffff');
    root.style.setProperty('--bg-secondary', result ? '#ededed' : '#2D3440');
    root.style.setProperty('--bg-modal', result ? '#ededed' : '#2D3440');
    btnTheme.src = result ? './assets/light-mode.svg' : './assets/dark-mode.svg';
    logo.src = result ? './assets/logo-dark.png' : './assets/logo.svg';
    btnNext.src = !result ? './assets/arrow-right-light.svg' : './assets/arrow-right-dark.svg';
    btnPrev.src = !result ? './assets/arrow-left-light.svg' : './assets/arrow-left-dark.svg';
    modalClose.src = !result ? './assets/close.svg' : './assets/close-dark.svg';
})
