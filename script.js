class WordleGame {
  constructor() {
    this.words = [
      "pride","chair","table","flute","crown","paint","river","light","spice","grace",
      "sound","apple","brave","charm","dance","earth","fable","grain","heart","image",
      "jelly","knife","lemon","magic","noble","ocean","pearl","queen","rocky","smile"
    ];
    this.answer = "";
    this.currentRow = 0;
    this.maxTries = 6;
    this.initBoard();
    this.getRandomWord();
  }

initBoard = () => {
  const board = document.getElementById("game-board");
  board.innerHTML = ""; 
  
  for (let i = 0; i < this.maxTries * 5; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
  }
};

getRandomWord = async () => {
  try {
    const res = await fetch("https://random-word-api.herokuapp.com/word?length=5");
    const data = await res.json();
    const randomWord = data[0].toLowerCase();

    const check = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
    if (check.ok) {
      this.answer = randomWord;
      console.log("Answer (valid from API):", this.answer);
    } else {
      this.answer = this.words[Math.floor(Math.random() * this.words.length)];
      console.log("Fallback (invalid API word):", this.answer);
    }
  } catch (err) {
    console.error("Random word API failed — using local fallback.");
    this.answer = this.words[Math.floor(Math.random() * this.words.length)];
    console.log("Fallback answer:", this.answer);
  }
};


handleGuess = async () => {
  const input = document.getElementById("guess-input");
  const guess = input.value.toLowerCase();

  if (guess.length !== 5) {
    alert("Please enter a 5-letter word!");
    return;
  }

  const isValid = await this.validateWord(guess);
  if (!isValid) {
    alert("That’s not a valid word! Try again.");
    return;
  }

  this.updateBoard(guess);
  this.updateUsedLetters(guess);

  // ✅ Check win condition
  if (guess === this.answer) {
    const guessesUsed = this.currentRow + 1;
    alert(`🎉 You win in ${guessesUsed} guesses!`);
    this.updateAverageScore(guessesUsed);
    document.getElementById("restart-btn").style.display = "block";
    return;
  }

  this.currentRow++;
  if (this.currentRow >= this.maxTries) {
    alert(`💀 Game over! The word was: ${this.answer.toUpperCase()}`);
    document.getElementById("restart-btn").style.display = "block";
  }

  input.value = "";
};

displayStats = () => {
  const data = JSON.parse(localStorage.getItem("wordleScores")) || [];
  const statsText = document.getElementById("stats-text");

  if (data.length === 0) {
    statsText.textContent = "No games played yet.";
    return;
  }

  const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
  statsText.textContent = `📊 Average guesses: ${avg.toFixed(2)} (across ${data.length} games)`;
};

updateAverageScore = (newScore) => {
  const data = JSON.parse(localStorage.getItem("wordleScores")) || [];
  data.push(newScore);
  localStorage.setItem("wordleScores", JSON.stringify(data));

  const avg =
    data.reduce((sum, val) => sum + val, 0) / data.length;
  alert(`📊 Average guesses per win: ${avg.toFixed(2)} (${data.length} games)`);
  this.displayStats();
};

  validateWord = async (word) => {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      return res.ok;
    } catch (err) {
      console.error("Error validating word:", err);
      return false;
    }
  };

  updateBoard = (guess) => {
    const cells = document.querySelectorAll(".cell");
    const start = this.currentRow * 5;
    [...guess].forEach((letter, i) => {
      const cell = cells[start + i];
      cell.textContent = letter;

      if (letter === this.answer[i]) {
        cell.classList.add("correct");
      } else if (this.answer.includes(letter)) {
        cell.classList.add("wrong-place");
      } else {
        cell.classList.add("not-in-word");
      }
    });
  };

  updateUsedLetters = (guess) => {
    const used = document.getElementById("used-letters");
    [...guess].forEach(letter => {
      const span = document.createElement("span");
      span.textContent = letter.toUpperCase() + " ";
      if (this.answer.includes(letter)) {
        span.classList.add(this.answer.indexOf(letter) === guess.indexOf(letter) ? "correct" : "wrong-place");
      } else {
        span.classList.add("not-in-word");
      }
      used.appendChild(span);
    });
  };
}



const game = new WordleGame();


document.getElementById("submit-btn").addEventListener("click", game.handleGuess);
document.getElementById("restart-btn").addEventListener("click", () => location.reload());

window.addEventListener("DOMContentLoaded", () => {
  const game = new WordleGame();
  game.displayStats();

  document.getElementById("submit-btn").addEventListener("click", game.handleGuess);
  document.getElementById("restart-btn").addEventListener("click", () => location.reload());
});
