async function searchMedia(type) {
  // Get the input element's value
  var movieName = document.getElementById("search").value;
  const apiKey = '0e9ade0abf158102c2f0931986405190';
  const searchUrl = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(movieName)}`;

  initItemsContainer();
  addLoadingIcon();
  const results = await getPage(type, searchUrl);
  if(results.length == 0){
    results.push(createNotFound());
  }
  initItemsContainer();
  let row = document.createElement("div");
  row.className = "row";
  document.getElementsByClassName("cards")[0].appendChild(row);

  for(let i = 0; i<results.length; i++){
    const rows = document.getElementsByClassName("row");

    if(rows[rows.length -1].getElementsByClassName("card").length == 4){
      let row = document.createElement("div");
      row.className = "row";
      document.getElementsByClassName("cards")[0].appendChild(row);
    }

    rows[rows.length - 1].appendChild(results[i]);
  }
}

function checkForMovieResults(type, movieName, movieid) {
  const url = `https://databasegdriveplayer.xyz/${type}.php?s=${encodeURIComponent(movieName.toLowerCase())}`;

    // Fetch the HTML content of the webpage
    const isOk = fetch(url)
    .then(response => response.text())
    .then(htmlText =>{
      // Create a temporary DOM element to parse the HTML
      const tempElement = document.createElement('div');
      tempElement.innerHTML = htmlText;
      // Find the table element
      const resultsTable = tempElement.getElementsByTagName('table')[0];
      return resultsTable.innerHTML.includes(`${movieid}`);
    })
    .catch (error =>{
    console.error('Error:', error);
    return false; // Return false in case of any errors
  });
  return isOk;
}

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

Number.prototype.padLeft = function(base,chr){
  var  len = (String(base || 10).length - String(this).length)+1;
  return len > 0? new Array(len).join(chr || '0')+this : this;
}

function initItemsContainer(){
  document.getElementsByClassName("cards")[0].innerHTML = '';
}

function addLoadingIcon(){
  let loadingIcon = document.createElement("img");
  loadingIcon.src = "https://media3.giphy.com/media/twn3qOrkv9KBGgn0bc/giphy.gif?cid=6c09b95263zd9qo314g6kd3m623ecqa1lt74i0cuqwxnlu01&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s";
  loadingIcon.className = "loading-icon";
  document.getElementsByClassName("cards")[0].appendChild(loadingIcon);
}


async function getTrending(type) {
  let cards = [];
  const apiKey = '0e9ade0abf158102c2f0931986405190';

  initItemsContainer();
  addLoadingIcon();

  for(let pageCount = 1; cards.length < 16 && pageCount < 10; pageCount++){
    const searchUrl = `https://api.themoviedb.org/3/${type}/popular?api_key=${apiKey}&page=${pageCount}`;
    const newCards = await getPage(type, searchUrl);
    cards = cards.concat(newCards);
  }

  initItemsContainer();

  let row = document.createElement("div");
  row.className = "row";
  document.getElementsByClassName("cards")[0].appendChild(row);

  for(let i = 0; i<Math.min(16, cards.length); i++){
    const rows = document.getElementsByClassName("row");

    if(rows[rows.length -1].getElementsByClassName("card").length == 4){
      let row = document.createElement("div");
      row.className = "row";
      document.getElementsByClassName("cards")[0].appendChild(row);
    }

    rows[rows.length - 1].appendChild(cards[i]);
  }
}

async function getPage(type, searchUrl) {
  try {
    const apiKey = '0e9ade0abf158102c2f0931986405190';
    const items = [];
    console.log(searchUrl);
    const response = await fetch(searchUrl);
    const data = await response.json();
    const results = [...data.results];

    const fetchPromises = results.map(async (result) => {
      try {
      const movieId = result.id;
      const movieDetailsUrl = `https://api.themoviedb.org/3/${type}/${movieId}?api_key=${apiKey}`;
      const response = await fetch(movieDetailsUrl);
      const movieData = await response.json();

      if (
        movieData?.poster_path &&
        (movieData?.title || movieData?.name) &&
        (type === 'tv'
          ? await checkForMovieResults('series', movieData?.name, movieId)
          : await checkForMovieResults(type, movieData?.title, movieId))
      ) {
        let card = createCard(type, movieId, movieData);
        items.push(card);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
    });

    await Promise.all(fetchPromises);

    return items;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function createNotFound(){
  let notFound = document.createElement("div");
  let notFoundText = document.createElement("p");
  let notFoundIcon = document.createElement("img");
  notFoundIcon.src = "https://www.eagleworksolutions.co.uk/images/no-search-found.png";
  notFoundText.innerText = "Sorry, no results found for this search..."
  notFound.className = "not-found";

  notFound.appendChild(notFoundIcon);
  notFound.appendChild(notFoundText);
  return notFound;
}

function createCard(type, movieId, movieData){
  let card = document.createElement("div");
  card.className = "card";
  card.onclick = () => {
    window.location.href = buildUrl('./player.html', {type: type, tmdb: movieId, imdb: movieData.imdb_id});
  }
  let cardData = document.createElement("div");
  let poster = document.createElement("img");
  poster.src = `https://image.tmdb.org/t/p/original/${movieData.poster_path}`;
  poster.className = "poster";
  card.appendChild(poster);
  card.movieId = movieId;
  cardData.className = "data"
  cardData.innerText = (type === 'tv' ? movieData.name : movieData.title) + "\nRating: " + movieData.vote_average.toFixed(1) + "/10";
  card.appendChild(cardData);
  return card;
}

function buildUrl(baseUrl, queryParams){

// Convert the query parameters object into a query string
const queryString = Object.keys(queryParams)
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
  .join('&');

// Combine the base URL and the query string to form the final URL
const finalUrl = `${baseUrl}?${queryString}`;

return finalUrl;

}

function loadMoviePage(){
const searchParams = new URLSearchParams(window.location.search)
const movieId = searchParams.get('tmdb');
const type = searchParams.get('type');
const apiKey = '0e9ade0abf158102c2f0931986405190';
const movieDetailsUrl = `https://api.themoviedb.org/3/`+type+`/${movieId}?api_key=${apiKey}`;
  fetch(movieDetailsUrl)
    .then(response => response.json())
    .then(movieData => {
      let params = 'tmdb=' + movieId;
      if(type === 'tv'){
        params = "type=series&" + params + "&season=1&episode=1";
        buildSeriesSelector(movieData, "selection")
      }
      document.getElementsByTagName('iframe')[0].src = "https://databasegdriveplayer.xyz/player.php?" + params;
        document.getElementsByClassName('media-type')[0].innerText = type === 'tv' ? 'Series' : 'Movies';
        document.getElementsByClassName('back-img')[0].src="https://image.tmdb.org/t/p/original"+movieData.backdrop_path;
        document.getElementsByClassName('overlay-text')[0].innerText = movieData.title ? movieData.title : movieData.name;
        document.getElementsByClassName('movie-data')[0].innerText = movieData.overview;
        document.getElementsByTagName('title')[0].innerText += movieData.title ? movieData.title : movieData.name;
        document.getElementsByClassName('rating-data')[0].innerText = movieData.vote_average.toFixed(1) + "/10";
        document.getElementsByClassName('vote-count')[0].innerText = `(${movieData.vote_count} voters)`;
        document.getElementsByClassName('info-header')[0].innerText = 
        `${(movieData.release_date ? movieData.release_date : movieData.first_air_date).split('-')[0]} • ${(movieData.origin_country ? movieData.origin_country[0] : movieData.production_countries[0].name)} • ${movieData.spoken_languages[0].name}  `;
        })
        .catch(error => {
          console.error('Error fetching movie details:', error);
        });
      }

let currentIndex = 0;

function showNextMessage() {
  const messageItems = document.querySelectorAll('.message-item');
  const navButtons = document.querySelectorAll('.system-messages-nav-button');
  messageItems[currentIndex].classList.remove('slide-in', 'slide-out');
  navButtons[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % messageItems.length;
  messageItems[currentIndex].classList.add('slide-in');
  navButtons[currentIndex].classList.add('active');
  setTimeout(showNextMessage, 60000);
}



// Function to show a specific message when a nav button is clicked
function showMessage(index) {
  const messageItems = document.querySelectorAll('.message-item');
  const navButtons = document.querySelectorAll('.system-messages-nav-button');
  messageItems[currentIndex].classList.remove('slide-in', 'slide-out');
  navButtons[currentIndex].classList.remove('active');
  currentIndex = index;
  messageItems[currentIndex].classList.add('slide-in');
  navButtons[currentIndex].classList.add('active');
}

function buildSeriesSelector(seriesData, targetElementId) {
    try {
      // Get the total number of seasons and episodes from the provided seriesData
      const numSeasons = seriesData.number_of_seasons;
      const numEpisodes = seriesData.number_of_episodes;
  
      // Get the target element where the selector will be added
      const targetElement = document.getElementById(targetElementId);
  
      // Create a div element for the series selector
      const seriesSelectorDiv = document.createElement('div');
      seriesSelectorDiv.className = 'series-selector';
  
      // Create a select element for seasons
      const seasonSelect = document.createElement('select');
      seasonSelect.classname = 'selector';
      seasonSelect.id = 'season-select';
  
      // Populate season options
      for (let seasonNumber = 1; seasonNumber <= numSeasons; seasonNumber++) {
        const option = document.createElement('option');
        option.value = seasonNumber;
        option.textContent = `Season ${seasonNumber}`;
        seasonSelect.appendChild(option);
      }
  
      // Create a select element for episodes
      const episodeSelect = document.createElement('select');
      episodeSelect.classname = 'selector';
      episodeSelect.id = 'episode-select'
      seasonSelect.addEventListener('change', updateIframe);
      episodeSelect.addEventListener('change', updateIframe);
  
          // Initially populate episode options for the first season
for (let episodeNumber = 1; episodeNumber <= seriesData.seasons[0].episode_count; episodeNumber++) {
  const option = document.createElement('option');
  option.value = episodeNumber;
  option.textContent = `Episode ${episodeNumber}`;
  episodeSelect.appendChild(option);
}

    // Append season and episode selectors to the div
    seriesSelectorDiv.appendChild(seasonSelect);
    seriesSelectorDiv.appendChild(episodeSelect);

    // Handle season selection change to update episode options
    seasonSelect.addEventListener('change', () => {
      const selectedSeasonNumber = parseInt(seasonSelect.value);

      // Clear existing episode options
      episodeSelect.innerHTML = '';

      // Populate episode options based on the selected season's episode count
      const selectedSeasonData = seriesData.seasons.find((season) => season.season_number === selectedSeasonNumber);
      if (selectedSeasonData) {
        for (let episodeNumber = 1; episodeNumber <= selectedSeasonData.episode_count; episodeNumber++) {
          const option = document.createElement('option');
          option.value = episodeNumber;
          option.textContent = `Episode ${episodeNumber}`;
          episodeSelect.appendChild(option);
        }
      }
    });

    // Append the series selector div to the target element
    targetElement.appendChild(seriesSelectorDiv);
  } catch (error) {
    console.error('Error:', error);
  }
}

function updateIframe(){
  const selectedSeason = document.getElementById('season-select').value;
  const selectedEpisode = document.getElementById('episode-select').value;
  document.getElementsByTagName('iframe')[0].src = `https://databasegdriveplayer.xyz/player.php?type=series&tmdb=`+
  `${new URLSearchParams(window.location.search).get('tmdb')}&season=${selectedSeason}&episode=${selectedEpisode}`;
}

function openContentManually(){
  window.open(document.getElementsByTagName('iframe')[0].src, '_blank');
}

function switchToImdb(){
  const imdb_id = new URLSearchParams(window.location.search).get('imdb');
  if(imdb_id !== "undefined"){
      const selectedSeason = document.getElementById('season-select') ? `&season=${document.getElementById('season-select').value}` : '';
      const selectedEpisode = document.getElementById('episode-select') ? `&episode=${document.getElementById('episode-select').value}` : '';
      let type = new URLSearchParams(window.location.search).get('type');
      type = type === 'tv' ? 'type=series&' : '';
      document.getElementsByTagName('iframe')[0].src = `https://databasegdriveplayer.xyz/player.php?${type}imdb=${imdb_id}${selectedSeason}${selectedEpisode}&sandbox=true`;
    }
  }