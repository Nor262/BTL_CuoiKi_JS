// API Base URL
const API_BASE_URL = "https://api.jikan.moe/v4"

// DOM Elements
const topAnimeContainer = document.getElementById("top-anime-container")
const seasonalContainer = document.getElementById("seasonal-container")
const genresContainer = document.getElementById("genres-container")
const genreResultsSection = document.getElementById("genre-results")
const genreResultsContainer = document.getElementById("genre-results-container")
const genreTitle = document.getElementById("genre-title")
const genreLoading = document.getElementById("genre-loading")
const backToGenresBtn = document.getElementById("back-to-genres")
const animeModal = document.getElementById("anime-modal")
const modalContent = document.getElementById("modal-content")
const closeModalBtn = document.getElementById("close-modal")
const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button")
const searchResultsSection = document.getElementById("search-results")
const searchResultsContainer = document.getElementById("search-results-container")
const searchLoading = document.getElementById("search-loading")
const searchNoResults = document.getElementById("search-no-results")
const randomButton = document.getElementById("random-button")
const randomModal = document.getElementById("random-modal")
const randomModalContent = document.getElementById("random-modal-content")
const closeRandomModalBtn = document.getElementById("close-random-modal")
const anotherRandomBtn = document.getElementById("another-random")
const trendingButton = document.getElementById("trending-button")
const watchlistIcon = document.getElementById("watchlist-icon")
const watchlistCount = document.getElementById("watchlist-count")
const watchlistSection = document.getElementById("watchlist-section")
const watchlistContainer = document.getElementById("watchlist-container")
const watchlistEmpty = document.getElementById("watchlist-empty")
const clearWatchlistBtn = document.getElementById("clear-watchlist")
const watchlistNotification = document.getElementById("watchlist-notification")
const notificationText = document.getElementById("notification-text")
const logoutButtonContainer = document.getElementById("logout-button-container")
const logoutButton = document.getElementById("logout-button")
const userName = document.getElementById("user-name")
const userContainer = document.getElementById("user-container")

if (localStorage.getItem("loggedIn") === "true") {
  userName.textContent = localStorage.getItem("username")
} else {
  userName.textContent = "Login"
  logoutButtonContainer.classList.add("hidden")
}

userContainer.addEventListener("click", () => {
  if (localStorage.getItem("loggedIn") === "false" || localStorage.getItem("loggedIn") === null) {
    window.location.href = "../login/index.html"
  }
})

// Logout functionality
logoutButton.addEventListener("click", () => {
  localStorage.setItem("loggedIn", "false")
  localStorage.removeItem("username")
  localStorage.removeItem("watchlist")
  localStorage.removeItem("animeWatchlist")
  sessionStorage.clear
  userName.textContent = "Login"
  logoutButtonContainer.classList.add("hidden")
  location.reload()
})

// --- Watchlist functionality sử dụng server ---
let watchlist = [];

// --- Show notification
function showNotification(message) {
  notificationText.textContent = message;
  watchlistNotification.classList.add("show");
  setTimeout(() => watchlistNotification.classList.remove("show"), 3000);
}

// --- Load watchlist from server
async function loadWatchlist() {
  const username = localStorage.getItem("username");
  if (!username) return;
  try {
    const res = await fetch(`http://localhost:3000/watchlist/${username}`);
    watchlist = await res.json();
    updateWatchlistCount();
    renderWatchlist();
  } catch (e) {
    watchlist = [];
    updateWatchlistCount();
    renderWatchlist();
  }
}

// --- Update count badge
function updateWatchlistCount() {
  const count = watchlist.length;
  watchlistCount.textContent = count;
  watchlistCount.classList.toggle("active", count > 0);
}

// --- Check if in watchlist
function isInWatchlist(animeId) {
  return watchlist.some(item => item.mal_id == animeId);
}

// --- Add / Remove anime
async function toggleWatchlist(anime) {
  const username = localStorage.getItem("username");
  if (!username || localStorage.getItem("loggedIn") !== "true") {
    showNotification("Vui lòng đăng nhập để thêm vào danh sách theo dõi");
    return;
  }
  const index = watchlist.findIndex(item => item.mal_id == anime.mal_id);
  if (index === -1) {
    // Add to watchlist in DB
    await fetch("http://localhost:3000/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        mal_id: anime.mal_id,
        title: anime.title,
        image_url: anime.images?.jpg?.image_url || anime.image_url,
        score: anime.score
      })
    });
    watchlist.push({
      mal_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images?.jpg?.image_url || anime.image_url,
      score: anime.score
    });
    showNotification(`Đã thêm "${anime.title}" vào danh sách theo dõi`);
  } else {
    // Remove from DB
    await fetch(`http://localhost:3000/watchlist/${username}/${anime.mal_id}`, {
      method: "DELETE"
    });
    watchlist.splice(index, 1);
    showNotification(`Đã xóa "${anime.title}" khỏi danh sách theo dõi`);
  }
  updateWatchlistCount();
  renderWatchlist();
  updateWatchlistButtons(anime.mal_id);
}

// --- Update bookmark icons
function updateWatchlistButtons(animeId) {
  const inList = isInWatchlist(animeId);
  document.querySelectorAll(`.watchlist-btn[data-id="${animeId}"]`).forEach(btn => {
    btn.classList.toggle("in-list", inList);
    const icon = btn.querySelector("ion-icon");
    if (icon) icon.setAttribute("name", inList ? "bookmark" : "bookmark-outline");
  });
  const modalWatchlistBtn = document.getElementById("modal-watchlist-btn");
  if (modalWatchlistBtn && modalWatchlistBtn.getAttribute("data-id") == String(animeId)) {
    modalWatchlistBtn.classList.toggle("in-list", inList);
    const icon = modalWatchlistBtn.querySelector("ion-icon");
    if (icon) icon.setAttribute("name", inList ? "bookmark" : "bookmark-outline");
  }
  const randomWatchlistBtn = document.getElementById("random-watchlist-btn");
  if (randomWatchlistBtn && randomWatchlistBtn.getAttribute("data-id") == String(animeId)) {
    randomWatchlistBtn.classList.toggle("in-list", inList);
    const icon = randomWatchlistBtn.querySelector("ion-icon");
    if (icon) icon.setAttribute("name", inList ? "bookmark" : "bookmark-outline");
  }
}

// --- Render watchlist section
function renderWatchlist() {
  watchlistContainer.innerHTML = "";
  if (watchlist.length === 0) {
    watchlistEmpty.classList.remove("hidden");
    return;
  }
  watchlistEmpty.classList.add("hidden");
  watchlist.forEach(anime => {
    const card = createAnimeCard(anime);
    watchlistContainer.appendChild(card);
  });
}

// --- Clear all
async function clearWatchlist() {
  const username = localStorage.getItem("username");
  if (!username) return;
  if (watchlist.length === 0) {
    alert("Có gì đâu mà xóa?!");
    return;
  }
  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ danh sách theo dõi?")) {
    await fetch(`http://localhost:3000/watchlist/clear/${username}`, { method: "DELETE" });
    watchlist = [];
    updateWatchlistCount();
    renderWatchlist();
    location.reload();
  }
}

// --- Bind UI
if (watchlistIcon) {
  watchlistIcon.addEventListener("click", () => {
    watchlistSection.classList.toggle("hidden");
    if (!watchlistSection.classList.contains("hidden")) renderWatchlist();
  });
}

if (clearWatchlistBtn) {
  clearWatchlistBtn.addEventListener("click", clearWatchlist);
}

// --- Load on page start
if (localStorage.getItem("loggedIn") === "true") {
  loadWatchlist();
}

// --- Export toggle for cards
window.toggleWatchlist = toggleWatchlist;

// Helper function to handle API rate limiting
async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(url)

      if (response.status === 429) {
        // Rate limited, wait and retry
        retries++
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      retries++
      if (retries === maxRetries) {
        console.error("Max retries reached:", error)
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
}

// Function to create anime card
function createAnimeCard(anime, isHorizontal = false) {
  const inWatchlist = isInWatchlist(anime.mal_id)
  const card = document.createElement("div")
  card.className = "anime-card"

  card.innerHTML = `
    <div class="card-inner" data-id="${anime.mal_id}">
      <div class="image-container">
        <img src="${anime.images ? anime.images.jpg.image_url : anime.image_url}" alt="${anime.title}">
        <button class="watchlist-btn ${inWatchlist ? "in-list" : ""}" data-id="${anime.mal_id}">
          <ion-icon name="${inWatchlist ? "bookmark" : "bookmark-outline"}"></ion-icon>
        </button>
      </div>
      <div class="content">
        <h3 class="title">${anime.title}</h3>
        <div class="info">
          <span class="score">★ ${anime.score ? anime.score.toFixed(1) : "N/A"}</span>
          ${anime.season ? `<span class="season">${anime.season} ${anime.year || ""}</span>` : ""}
        </div>
        ${
          anime.genres
            ? `
        <div class="genres">
          ${anime.genres
            .slice(0, 2)
            .map((genre) => `<span class="genre-tag">${genre.name}</span>`)
            .join("")}
        </div>`
            : ""
        }
      </div>
    </div>
  `

  // Add click event to show anime details
  card.querySelector("[data-id]").addEventListener("click", (e) => {
    if (!e.target.closest(".watchlist-btn")) {
      showAnimeDetails(anime.mal_id)
    }
  })

  // Add click event to toggle watchlist
  card.querySelector(".watchlist-btn").addEventListener("click", (e) => {
    e.stopPropagation()
    toggleWatchlist(anime)

    const btn = e.target.closest(".watchlist-btn")
    const svg = btn.querySelector("svg")

    if (isInWatchlist(anime.mal_id)) {
      btn.classList.add("in-list")
    } else {
      btn.classList.remove("in-list")
    }
  })

  return card
}

// Function to create genre card
function createGenreCard(genre) {
  const colors = [
    "linear-gradient(to bottom right, #dc2626, #7f1d1d)",
    "linear-gradient(to bottom right, #2563eb, #1e3a8a)",
    "linear-gradient(to bottom right, #16a34a, #14532d)",
    "linear-gradient(to bottom right, #9333ea, #581c87)",
    "linear-gradient(to bottom right, #ca8a04, #713f12)",
    "linear-gradient(to bottom right, #db2777, #831843)",
    "linear-gradient(to bottom right, #4f46e5, #312e81)",
    "linear-gradient(to bottom right, #0d9488, #134e4a)",
  ]

  const colorStyle = colors[Math.floor(Math.random() * colors.length)]

  const card = document.createElement("div")
  card.className = "genre-card"
  card.style.background = colorStyle
  card.setAttribute("data-id", genre.mal_id)
  card.innerHTML = `<span class="genre-name">${genre.name}</span>`

  // Add click event to show anime by genre
  card.addEventListener("click", () => {
    showAnimeByGenre(genre.mal_id, genre.name)
  })

  return card
}

// Function to show anime details in modal
async function showAnimeDetails(animeId) {
  // Show modal with loading state
  animeModal.classList.remove("hidden")
  modalContent.innerHTML = `
    <div class="loading-container">
      <div class="loader"></div>
    </div>
  `

  try {
    const data = await fetchWithRetry(`${API_BASE_URL}/anime/${animeId}/full`)
    const anime = data.data

    // Format airing information
    let airingInfo = "Unknown"
    if (anime.aired && anime.aired.from) {
      const startDate = new Date(anime.aired.from).getFullYear()
      const endDate = anime.aired.to ? new Date(anime.aired.to).getFullYear() : "Present"
      airingInfo = startDate === endDate ? startDate : `${startDate} - ${endDate}`
    }

    // Format studios
    const studios = anime.studios.map((studio) => studio.name).join(", ") || "Unknown"

    // Check if anime is in watchlist
    const inWatchlist = isInWatchlist(anime.mal_id)

    modalContent.innerHTML = `
      <div class="anime-details">
        <div class="anime-poster">
          <div class="poster-container">
            <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" 
                alt="${anime.title}">
          </div>
          <div class="anime-info">
            <div class="info-row">
              <span class="info-label">Score:</span>
              <span class="info-value score-value">${anime.score ? anime.score.toFixed(1) : "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Rank:</span>
              <span class="info-value">#${anime.rank || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${anime.status || "Unknown"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Episodes:</span>
              <span class="info-value">${anime.episodes || "Unknown"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Year:</span>
              <span class="info-value">${airingInfo}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Studio:</span>
              <span class="info-value">${studios}</span>
            </div>
          </div>
        </div>
        <div class="anime-content">
          <div class="anime-header">
            <h2 class="anime-title">${anime.title}</h2>
            <button id="modal-watchlist-btn" data-id="${anime.mal_id}" class="modal-watchlist-btn ${inWatchlist ? "in-list" : ""}">
              <ion-icon name="${inWatchlist ? "bookmark" : "bookmark-outline"}"></ion-icon>
            </button>
          </div>
          <h3 class="anime-japanese">${anime.title_japanese || ""}</h3>
          
          <div class="anime-genres">
            ${anime.genres.map((genre) => `<span class="anime-genre">${genre.name}</span>`).join("")}
          </div>
          
          <div class="anime-section">
            <h4 class="anime-section-title">Synopsis</h4>
            <p class="anime-synopsis">${anime.synopsis || "No synopsis available."}</p>
          </div>
          
          ${
            anime.trailer && anime.trailer.embed_url
              ? `
          <div class="anime-section">
            <h4 class="anime-section-title">Trailer</h4>
            <div class="trailer-container">
              <iframe 
                src="${anime.trailer.embed_url}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>
          </div>
          `
              : ""
          }
          
          <div class="anime-actions">
            ${
              anime.url
                ? `
            <a href="${anime.url}" target="_blank" class="external-link">
              <ion-icon name="open-outline" class="button-icon"></ion-icon>
              View on MyAnimeList
            </a>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `

    // Add watchlist toggle functionality to modal button
    const modalWatchlistBtn = document.getElementById("modal-watchlist-btn")
    if (modalWatchlistBtn) {
      modalWatchlistBtn.setAttribute("data-id", anime.mal_id);
      modalWatchlistBtn.addEventListener("click", () => {
        toggleWatchlist(anime)
      });
    }
  } catch (error) {
    console.error("Error fetching anime details:", error)
    modalContent.innerHTML = `
      <div class="no-results">
        <p class="error-message">Failed to load anime details. Please try again later.</p>
      </div>
    `
  }
}

// Function to show anime by genre
async function showAnimeByGenre(genreId, genreName) {
  // Show genre results section and hide genres section
  genreResultsSection.classList.remove("hidden")
  document.getElementById("genres").classList.add("hidden")

  // Update genre title
  genreTitle.textContent = `Genre: ${genreName}`

  // Show loading
  genreResultsContainer.innerHTML = ""
  genreLoading.classList.remove("hidden")

  try {
    const data = await fetchWithRetry(`${API_BASE_URL}/anime?genres=${genreId}&order_by=popularity&sort=asc&limit=24&sfw=true`)

    // Hide loading
    genreLoading.classList.add("hidden")

    // Display anime
    if (data.data && data.data.length > 0) {
      data.data.forEach((anime) => {
        genreResultsContainer.appendChild(createAnimeCard(anime))
      })
    } else {
      genreResultsContainer.innerHTML = `
        <div class="no-results">
          <p>No anime found for this genre.</p>
        </div>
      `
    }
  } catch (error) {
    console.error("Error fetching anime by genre:", error)
    genreLoading.classList.add("hidden")
    genreResultsContainer.innerHTML = `
      <div class="no-results">
        <p class="error-message">Failed to load anime. Please try again later.</p>
      </div>
    `
  }
}

// Function to search anime
async function searchAnime(query) {
  if (!query.trim()) return

  // Show search results section
  searchResultsSection.classList.remove("hidden")

  // Scroll to search results
  searchResultsSection.scrollIntoView({ behavior: "smooth" })

  // Clear previous results and show loading
  searchResultsContainer.innerHTML = ""
  searchLoading.classList.remove("hidden")
  searchNoResults.classList.add("hidden")

  try {
    const data = await fetchWithRetry(
      `${API_BASE_URL}/anime?q=${encodeURIComponent(query)}&order_by=popularity&sort=asc&limit=24&sfw=true`,
    )

    // Hide loading
    searchLoading.classList.add("hidden")

    // Display search results
    if (data.data && data.data.length > 0) {
      data.data.forEach((anime) => {
        searchResultsContainer.appendChild(createAnimeCard(anime))
      })
    } else {
      searchNoResults.classList.remove("hidden")
    }
  } catch (error) {
    console.error("Error searching anime:", error)
    searchLoading.classList.add("hidden")
    searchResultsContainer.innerHTML = `
      <div class="no-results">
        <p class="error-message">Failed to search anime. Please try again later.</p>
      </div>
    `
  }
}

// Function to get random anime
async function getRandomAnime() {
  // Show random modal with loading state
  randomModal.classList.remove("hidden")
  randomModalContent.innerHTML = `
    <div class="loading-container">
      <div class="loader"></div>
    </div>
  `

  try {
    const data = await fetchWithRetry(`${API_BASE_URL}/random/anime`)
    const anime = data.data

    // Format airing information
    let airingInfo = "Unknown"
    if (anime.aired && anime.aired.from) {
      const startDate = new Date(anime.aired.from).getFullYear()
      const endDate = anime.aired.to ? new Date(anime.aired.to).getFullYear() : "Present"
      airingInfo = startDate === endDate ? startDate : `${startDate} - ${endDate}`
    }

    // Format studios
    const studios = anime.studios.map((studio) => studio.name).join(", ") || "Unknown"

    // Check if anime is in watchlist
    const inWatchlist = isInWatchlist(anime.mal_id)

    randomModalContent.innerHTML = `
      <div class="anime-details">
        <div class="anime-poster">
          <div class="poster-container">
            <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" 
                alt="${anime.title}">
          </div>
          <div class="anime-info">
            <div class="info-row">
              <span class="info-label">Score:</span>
              <span class="info-value score-value">${anime.score ? anime.score.toFixed(1) : "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${anime.status || "Unknown"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Episodes:</span>
              <span class="info-value">${anime.episodes || "Unknown"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Year:</span>
              <span class="info-value">${airingInfo}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Studio:</span>
              <span class="info-value">${studios}</span>
            </div>
          </div>
        </div>
        <div class="anime-content">
          <div class="anime-header">
            <h2 class="anime-title">${anime.title}</h2>
            <button id="random-watchlist-btn" class="modal-watchlist-btn ${inWatchlist ? "in-list" : ""}">
              <ion-icon name="${inWatchlist ? "bookmark" : "bookmark-outline"}"></ion-icon>
            </button>
          </div>
          <h3 class="anime-japanese">${anime.title_japanese || ""}</h3>
          
          <div class="anime-genres">
            ${anime.genres.map((genre) => `<span class="anime-genre">${genre.name}</span>`).join("")}
          </div>
          
          <div class="anime-section">
            <h4 class="anime-section-title">Synopsis</h4>
            <p class="anime-synopsis">${anime.synopsis || "No synopsis available."}</p>
          </div>
          
          <div class="anime-actions">
            ${
              anime.url
                ? `
        <a href="${anime.url}" target="_blank" class="external-link">
          <ion-icon name="open-outline" class="button-icon"></ion-icon>
          View on MyAnimeList
        </a>
        `
                : ""
            }
          </div>
        </div>
      </div>
    `

    // Add watchlist toggle functionality to random modal button
    const randomWatchlistBtn = document.getElementById("random-watchlist-btn")
    randomWatchlistBtn.addEventListener("click", () => {
      toggleWatchlist(anime)
    })
  } catch (error) {
    console.error("Error fetching random anime:", error)
    randomModalContent.innerHTML = `
      <div class="no-results">
        <p class="error-message">Failed to load random anime. Please try again later.</p>
      </div>
    `
  }
}

// Function to load initial data
async function loadInitialData() {
  try {
    // Load top anime
    const topData = await fetchWithRetry(`${API_BASE_URL}/top/anime?limit=12`)
    topAnimeContainer.innerHTML = ""
    topData.data.forEach((anime) => {
      topAnimeContainer.appendChild(createAnimeCard(anime))
    })

    // Load seasonal anime
    const seasonalData = await fetchWithRetry(`${API_BASE_URL}/seasons/now?limit=12`)
    seasonalContainer.innerHTML = ""
    seasonalData.data.forEach((anime) => {
      seasonalContainer.appendChild(createAnimeCard(anime, false))
    })

    // Load genres
    const genresData = await fetchWithRetry(`${API_BASE_URL}/genres/anime?sfw=true`)
    genresContainer.innerHTML = ""
    genresData.data.forEach((genre) => {
      genresContainer.appendChild(createGenreCard(genre))
    })
  } catch (error) {
    console.error("Error loading initial data:", error)
    // Remove skeleton loaders on error
    topAnimeContainer.innerHTML =
      '<div class="no-results"><p class="error-message">Failed to load anime data. Please refresh the page.</p></div>'
    seasonalContainer.innerHTML =
      '<div class="no-results"><p class="error-message">Failed to load seasonal anime. Please refresh the page.</p></div>'
    genresContainer.innerHTML =
      '<div class="no-results"><p class="error-message">Failed to load genres. Please refresh the page.</p></div>'
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Initialize watchlist count
  updateWatchlistCount()

  // Load initial data
  loadInitialData()

  // Search functionality
  searchButton.addEventListener("click", () => {
    searchAnime(searchInput.value)
  })

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchAnime(searchInput.value)
    }
  })

  // Random anime button
  randomButton.addEventListener("click", getRandomAnime)
  anotherRandomBtn.addEventListener("click", getRandomAnime)

  // Trending button - scroll to top anime
  trendingButton.addEventListener("click", () => {
    document.getElementById("top-anime").scrollIntoView({ behavior: "smooth" })
  })

  // Back to genres button
  backToGenresBtn.addEventListener("click", () => {
    genreResultsSection.classList.add("hidden")
    document.getElementById("genres").classList.remove("hidden")
  })

  // Modal close buttons
  closeModalBtn.addEventListener("click", () => {
    animeModal.classList.add("hidden")
  })

  closeRandomModalBtn.addEventListener("click", () => {
    randomModal.classList.add("hidden")
  })

  // Close modals when clicking outside
  animeModal.addEventListener("click", (e) => {
    if (e.target === animeModal) {
      animeModal.classList.add("hidden")
    }
  })

  randomModal.addEventListener("click", (e) => {
    if (e.target === randomModal) {
      randomModal.classList.add("hidden")
    }
  })

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      animeModal.classList.add("hidden")
      randomModal.classList.add("hidden")
    }
  })
})
