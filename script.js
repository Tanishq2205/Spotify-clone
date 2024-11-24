let currentSong = new Audio();
let songs;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00.00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
  try {
    let response = await fetch("http://127.0.0.1:3000/songs/");
    let text = await response.text();
    console.log(text);

    let div = document.createElement("div");
    div.innerHTML = text;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split("/songs/")[1]);
      }
    }

    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

const playMusic = (track, pause = false) => {
  currentSong.src = "/songs/" + track;
  if (!pause) {
    currentSong.play();
    document.getElementById("play").src = "pause.svg";
  } else {
    document.getElementById("play").src = "play.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
  songs = await getSongs();
  if (!songs || songs.length === 0) {
    console.error("No songs found!");
    return;
  }
  playMusic(songs[0], true);

  let songsUL = document.querySelector(".songList ul");
  songsUL.innerHTML = ""; // Clear any existing content

  for (const song of songs) {
    let formattedSong = song.replace(/%20/g, " ");
    let li = document.createElement("li");

    li.innerHTML = `
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${formattedSong}</div>
                <div>Tanishq</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        `;

    songsUL.appendChild(li);
  }

  // Attach click event listeners to each song item
  document.querySelectorAll(".songList li").forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info div").textContent.trim());
    });
  });
}

// Handle play/pause button click
let play = document.getElementById("play");

play.addEventListener("click", () => {
  if (currentSong.paused) {
    currentSong.play();
    play.src = "pause.svg";
  } else {
    currentSong.pause();
    play.src = "play.svg";
  }
});

// Update song time and progress circle
currentSong.addEventListener("timeupdate", () => {
  let currentTime = currentSong.currentTime;
  let duration = currentSong.duration || 0; // Handle NaN case
  document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
    currentTime
  )} / ${secondsToMinutesSeconds(duration)}`;
  document.querySelector(".circle").style.left =
    (currentTime / duration) * 100 + "%";
});

// Seekbar functionality
document.querySelector(".seekbar").addEventListener("click", (e) => {
  let rect = e.target.getBoundingClientRect();
  let clickPosition = (e.offsetX / rect.width) * currentSong.duration;
  currentSong.currentTime = clickPosition;
});

// Hamburger menu functionality
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%";
});

// Handle previous and next button functionality

let previous = document.getElementById("previous");
let next = document.getElementById("next");

previous.addEventListener("click", () => {
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index > 0) {
    playMusic(songs[index - 1]);
  }
});

next.addEventListener("click", () => {
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index < songs.length - 1) {
    playMusic(songs[index + 1]);
  }
});

// Call the main function directly as requested
main();



