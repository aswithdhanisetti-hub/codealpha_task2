// --- Elements ---
const audio = document.getElementById('audio');
const playBtn = document.getElementById('btn-play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const shuffleBtn = document.getElementById('btn-shuffle');
const repeatBtn = document.getElementById('btn-repeat');

const title = document.getElementById('song-title');
const artist = document.getElementById('song-artist');
const cover = document.getElementById('cover-image');

// Slide Menu
const menuBtn = document.getElementById('menu-btn');
const slideMenu = document.getElementById('slide-menu');
const menuOverlay = document.getElementById('menu-overlay');

// Search Elements
const navSearchBtn = document.getElementById('nav-search');
const searchOverlay = document.getElementById('search-overlay');
const closeSearchBtn = document.getElementById('close-search');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

const progress = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume-slider');

// --- Playlist ---
let songs = [
    {
        name: "Synthwave Night Drive",
        artist: "Retro Enigma",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "images/cover1.png"
    },
    {
        name: "Dream Escape",
        artist: "Neon Waves",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "images/cover2.png"
    },
    {
        name: "Midnight City",
        artist: "Night Runner",
        file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "images/cover1.png"
    }
];

let songIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// --- Initialize from LocalStorage ---
window.onload = function() {
    let savedSong = localStorage.getItem("songIndex");
    if(savedSong) {
        songIndex = parseInt(savedSong);
        loadSong(songIndex);
    } else {
        loadSong(0);
    }
}

// Update song details
function loadSong(index) {
    songIndex = index;
    title.innerText = songs[index].name;
    artist.innerText = songs[index].artist;
    cover.src = songs[index].cover;
    audio.src = songs[index].file;
    
    // Save to localStorage
    localStorage.setItem("songIndex", songIndex);
    
    // reset progress
    progress.value = 0;
    currentTimeEl.innerText = "0:00";
}

// Play/Pause
function playSong() {
    isPlaying = true;
    playIcon.classList.replace('ph-play', 'ph-pause');
    playIcon.classList.remove('ml-1'); // adjust margin for pause icon centering
    cover.classList.add("rotate"); // Add rotate animation
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    playIcon.classList.replace('ph-pause', 'ph-play');
    playIcon.classList.add('ml-1');
    cover.classList.remove("rotate"); // Remove rotate animation
    audio.pause();
}

playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

// Previous / Next Song
function prevSong() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songIndex);
    if (isPlaying) playSong();
}

function nextSong() {
    if (isShuffle) {
        let newIndex = songIndex;
        while(newIndex === songIndex && songs.length > 1) {
            newIndex = Math.floor(Math.random() * songs.length);
        }
        songIndex = newIndex;
    } else {
        songIndex = (songIndex + 1) % songs.length;
    }
    loadSong(songIndex);
    if (isPlaying) playSong();
}

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Audio Events
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationEl.innerText = formatTime(audio.duration);
});
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        playSong();
    } else {
        nextSong();
    }
});

// Progress Bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    
    // Update progress bar value
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progress.value = progressPercent;
        
        // Update time labels
        currentTimeEl.innerText = formatTime(currentTime);
        // Sometimes duration isn't instantly available
        if(!isNaN(duration)) {
             durationEl.innerText = formatTime(duration);
        }
    }
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

progress.addEventListener('click', setProgress);

// Also allow dragging
progress.addEventListener('input', (e) => {
    if (audio.duration) {
        audio.currentTime = (e.target.value / 100) * audio.duration;
    }
});

// Volume Control
if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });
}

// Format Time (seconds -> M:SS)
function formatTime(time) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
}

// Shuffle & Repeat toggles
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('text-sky-400');
    shuffleBtn.classList.toggle('text-slate-400');
});

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('text-sky-400');
    repeatBtn.classList.toggle('text-slate-400');
});

// Menu Logic
function toggleMenu() {
    const isClosed = slideMenu.classList.contains('opacity-0');
    if (isClosed) {
        slideMenu.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
    } else {
        slideMenu.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        menuOverlay.classList.add('opacity-0', 'pointer-events-none');
    }
}

menuBtn.addEventListener('click', toggleMenu);
menuOverlay.addEventListener('click', toggleMenu);

// Search Logic
navSearchBtn.addEventListener('click', () => {
    searchOverlay.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        searchInput.focus();
    }, 100);
});

closeSearchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('opacity-0', 'pointer-events-none');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchResults.classList.add('hidden');
});

searchInput.addEventListener("input", function () {
    let query = searchInput.value.toLowerCase();
    searchResults.innerHTML = "";

    if(query === ""){
        searchResults.classList.add("hidden");
        return;
    }

    let filteredSongs = songs.filter(song =>
        song.name.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    if(filteredSongs.length === 0){
        searchResults.innerHTML = "<p class='p-5 text-xl text-gray-300 text-center'>No songs found</p>";
        searchResults.classList.remove("hidden");
        return;
    }

    filteredSongs.forEach(song => {
        let index = songs.indexOf(song);

        let div = document.createElement("div");
        div.className = "flex items-center gap-4 p-4 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors";

        div.innerHTML = `
            <img src="${song.cover}" class="w-12 h-12 rounded-lg object-cover shadow-md">
            <div>
                <p class="text-white font-semibold text-lg tracking-tight">${song.name}</p>
                <p class="text-sm text-indigo-200/60">${song.artist}</p>
            </div>
        `;

        div.onclick = () => {
            loadSong(index);
            playSong();
            searchResults.classList.add("hidden");
            searchInput.value = "";
            searchOverlay.classList.add('opacity-0', 'pointer-events-none');
        };

        searchResults.appendChild(div);
    });

    searchResults.classList.remove("hidden");
});

// --- Login Modal Logic ---
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const closeLogin = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');

if (loginBtn && loginModal) {
    // Open Modal
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('modal-active');
    });

    // Close Modal
    closeLogin.addEventListener('click', () => {
        loginModal.classList.remove('modal-active');
    });

    // Close on background click
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('modal-active');
        }
    });

    // Handle Login Simulation
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;

        // For simulation, let's ensure a user exists in localStorage if it's empty
        let storedUser = JSON.parse(localStorage.getItem('registeredUser'));
        
        // If no user is registered, use a default for testing
        if (!storedUser) {
            storedUser = { email: 'admin@sonicflow.com', pass: 'admin123' };
            localStorage.setItem('registeredUser', JSON.stringify(storedUser));
        }

        if (email === storedUser.email && pass === storedUser.pass) {
            alert('Login Successful!');
            loginModal.classList.remove('modal-active');
            loginForm.reset();
        } else {
            alert('Invalid credentials! \n\nTry:\nEmail: admin@sonicflow.com\nPass: admin123');
        }
    });
}

// --- Profile Dropdown Logic ---
const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');
const menuItems = document.querySelectorAll('.profile-menu-item');

if (profileBtn && profileDropdown) {
    // Toggle Dropdown
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('dropdown-active');
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (profileDropdown.classList.contains('dropdown-active') && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('dropdown-active');
        }
    });

    // Handle Menu Item Actions
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            
            switch (action) {
                case 'Account':
                    alert('Opening Account page');
                    break;
                case 'Profile':
                    alert('Opening Profile page');
                    break;
                case 'Settings':
                    alert('Opening Settings');
                    break;
                case 'AddAccount':
                    alert('Add new account feature coming soon');
                    break;
                case 'Logout':
                    localStorage.removeItem('registeredUser');
                    alert('Logged out successfully');
                    location.reload();
                    break;
            }
            profileDropdown.classList.remove('dropdown-active');
        });
    });
}

// =============================================
// --- LIBRARY SYSTEM ---
// =============================================

// --- Toast Notification ---
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('toast-active');
    setTimeout(() => {
        toast.classList.remove('toast-active');
    }, 2200);
}

// --- Like Song Feature ---
const likeBtn = document.getElementById('btn-like');
const likeIcon = document.getElementById('like-icon');

function getLikedSongs() {
    return JSON.parse(localStorage.getItem('likedSongs') || '[]');
}

function saveLikedSongs(arr) {
    localStorage.setItem('likedSongs', JSON.stringify(arr));
}

function isCurrentSongLiked() {
    const liked = getLikedSongs();
    const current = songs[songIndex];
    return liked.some(s => s.name === current.name && s.artist === current.artist);
}

function updateLikeButton() {
    if (!likeBtn) return;
    if (isCurrentSongLiked()) {
        likeBtn.classList.add('liked-active');
        likeIcon.classList.replace('ph-heart', 'ph-heart');
        likeIcon.classList.add('ph-fill');
    } else {
        likeBtn.classList.remove('liked-active');
        likeIcon.classList.remove('ph-fill');
    }
}

if (likeBtn) {
    likeBtn.addEventListener('click', () => {
        const current = songs[songIndex];
        let liked = getLikedSongs();
        const idx = liked.findIndex(s => s.name === current.name && s.artist === current.artist);
        
        if (idx > -1) {
            liked.splice(idx, 1);
            saveLikedSongs(liked);
            showToast('Removed from Liked Songs');
        } else {
            liked.push({ name: current.name, artist: current.artist, file: current.file, cover: current.cover });
            saveLikedSongs(liked);
            showToast('❤️ Added to Liked Songs');
        }
        updateLikeButton();
    });
}

// --- Recently Played Feature ---
function getRecentSongs() {
    return JSON.parse(localStorage.getItem('recentSongs') || '[]');
}

function addToRecentlyPlayed(song) {
    let recent = getRecentSongs();
    // Remove duplicates
    recent = recent.filter(s => !(s.name === song.name && s.artist === song.artist));
    // Add to front
    recent.unshift({ name: song.name, artist: song.artist, file: song.file, cover: song.cover });
    // Keep max 10
    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem('recentSongs', JSON.stringify(recent));
}

// --- Download Feature ---
const downloadBtn = document.getElementById('btn-download');

function getDownloadedSongs() {
    return JSON.parse(localStorage.getItem('downloadedSongs') || '[]');
}

if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const current = songs[songIndex];
        let downloads = getDownloadedSongs();
        const exists = downloads.some(s => s.name === current.name && s.artist === current.artist);
        
        if (exists) {
            showToast('Already in Downloads');
        } else {
            downloads.push({ name: current.name, artist: current.artist, file: current.file, cover: current.cover });
            localStorage.setItem('downloadedSongs', JSON.stringify(downloads));
            showToast('⬇️ Downloaded: ' + current.name);
        }
    });
}

// --- Patch playSong to track recently played ---
const _originalPlaySong = playSong;
playSong = function() {
    _originalPlaySong();
    addToRecentlyPlayed(songs[songIndex]);
    updateLikeButton();
};

// --- Patch loadSong to update like button ---
const _originalLoadSong = loadSong;
loadSong = function(index) {
    _originalLoadSong(index);
    updateLikeButton();
};

// --- Song Card Component ---
function createSongCard(song, onClick) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
        <img src="${song.cover}" alt="${song.name}">
        <div class="song-info">
            <div class="song-name">${song.name}</div>
            <div class="song-artist">${song.artist}</div>
        </div>
        <div class="play-btn-small">
            <i class="ph-fill ph-play text-sm"></i>
        </div>
    `;
    card.addEventListener('click', onClick);
    return card;
}

function renderEmptyState(container, message) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
}

// --- Library Page ---
const libraryOverlay = document.getElementById('library-overlay');
const libraryBack = document.getElementById('library-back');
const navLibrary = document.getElementById('nav-library');
const navHome = document.getElementById('nav-home');

function playSongByData(songData) {
    // Find matching song in the songs array
    let idx = songs.findIndex(s => s.name === songData.name && s.artist === songData.artist);
    if (idx === -1) {
        // Song not in main playlist — add it temporarily
        songs.push(songData);
        idx = songs.length - 1;
    }
    loadSong(idx);
    playSong();
    closeLibrary();
}

function renderLibrary() {
    // Liked Songs
    const likedContainer = document.getElementById('liked-songs-list');
    const liked = getLikedSongs();
    likedContainer.innerHTML = '';
    if (liked.length === 0) {
        renderEmptyState(likedContainer, 'No liked songs yet');
    } else {
        liked.forEach(song => {
            likedContainer.appendChild(createSongCard(song, () => playSongByData(song)));
        });
    }

    // Recently Played
    const recentContainer = document.getElementById('recent-songs-list');
    const recent = getRecentSongs();
    recentContainer.innerHTML = '';
    if (recent.length === 0) {
        renderEmptyState(recentContainer, 'No recently played songs');
    } else {
        recent.forEach(song => {
            recentContainer.appendChild(createSongCard(song, () => playSongByData(song)));
        });
    }

    // Downloads
    const downloadContainer = document.getElementById('downloaded-songs-list');
    const downloads = getDownloadedSongs();
    downloadContainer.innerHTML = '';
    if (downloads.length === 0) {
        renderEmptyState(downloadContainer, 'No downloads yet');
    } else {
        downloads.forEach(song => {
            downloadContainer.appendChild(createSongCard(song, () => playSongByData(song)));
        });
    }
}

function openLibrary() {
    renderLibrary();
    libraryOverlay.classList.add('library-open');
}

function closeLibrary() {
    libraryOverlay.classList.remove('library-open');
}

if (navLibrary) {
    navLibrary.addEventListener('click', openLibrary);
}
if (libraryBack) {
    libraryBack.addEventListener('click', closeLibrary);
}
if (navHome) {
    navHome.addEventListener('click', closeLibrary);
}

// Initial like button state
updateLikeButton();

