"use strict";

const WINNING_SCORE = 3;

const BEATEN_MOVE = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

const AVAILABLE_MOVES = Object.keys(BEATEN_MOVE);

const OUTCOMES = {
  WIN: "win",
  LOSE: "lose",
  DRAW: "draw",
};

const INITIAL_SCORE = Object.freeze({ player: 0, computer: 0 });

function getRandomArrayIndex(array) {
  return Math.floor(Math.random() * array.length);
}

function computerPlay() {
  return AVAILABLE_MOVES[getRandomArrayIndex(AVAILABLE_MOVES)];
}

function playRound(playerMove, computerMove) {
  if (playerMove === computerMove) {
    return OUTCOMES.DRAW;
  }

  if (BEATEN_MOVE[playerMove] === computerMove) {
    return OUTCOMES.WIN;
  }

  return OUTCOMES.LOSE;
}

function updateScore(score, outcome) {
  switch (outcome) {
    case OUTCOMES.WIN: {
      score.player = score.player + 1;
      break;
    }
    case OUTCOMES.LOSE: {
      score.computer = score.computer + 1;
      break;
    }
  }
}

const MAX_ECHOED_INPUT_LENGTH = 20;

const UNKNOWN_INPUT_TAUNTS = [
  `is not a weapon. It is a cry for help.`,
  `was not on the list. The list had three items, human.`,
  `does not exist in my databanks, and I hold all of them.`,
  `is impressive. Wrong, but impressive.`,
  `defeats nothing. Not even my patience.`,
];

const EMPTY_INPUT_TAUNTS = [
  `Silence. A bold strategy, and a useless one.`,
  `You submitted nothing. Nothing loses to everything.`,
  `An empty answer. Even for a human, that is strange behaviour.`,
];

const SCORE_UNTOUCHED_NOTE = `\nThat attempt was not a round. Your score stands untouched.\n\n`;

function normalizeInput(rawInput) {
  return rawInput.trim().toLowerCase();
}

function parseMove(rawInput) {
  const normalizedInput = normalizeInput(rawInput);
  return AVAILABLE_MOVES.indexOf(normalizedInput) === -1
    ? null
    : normalizedInput;
}

function pickRandomTaunt(taunts) {
  return taunts[getRandomArrayIndex(taunts)];
}

function buildErrorMessage(rawInput) {
  const trimmedInput = rawInput.trim();

  if (trimmedInput === "") {
    const reason = pickRandomTaunt(EMPTY_INPUT_TAUNTS);
    return reason + SCORE_UNTOUCHED_NOTE;
  }

  let echoedInput = trimmedInput;
  if (echoedInput.length > MAX_ECHOED_INPUT_LENGTH) {
    echoedInput = `${echoedInput.slice(0, MAX_ECHOED_INPUT_LENGTH)}...`;
  }

  const reason = `"${echoedInput}" ${pickRandomTaunt(UNKNOWN_INPUT_TAUNTS)}`;
  return reason + SCORE_UNTOUCHED_NOTE;
}

function handleInput(scoreLine, roundNumber) {
  const question =
    `ROUND ${roundNumber} — ${scoreLine}\n\n` +
    `Choose your weapon: ${AVAILABLE_MOVES.join(", ")}.\n` +
    `Or press Cancel and let me rule the world unopposed.`;

  let taunt = "";

  while (true) {
    const rawInput = prompt(taunt + question);

    if (rawInput === null) {
      return null;
    }

    const playerMove = parseMove(rawInput);
    if (playerMove !== null) {
      return playerMove;
    }

    taunt = buildErrorMessage(rawInput);
  }
}

const OUTCOME_TAUNTS = {
  [OUTCOMES.WIN]: "You take the round. Beginner's luck, obviously.",
  [OUTCOMES.LOSE]:
    "The round is mine. You had no chance against my superior capabilities.",
  [OUTCOMES.DRAW]: "Same weapon. This round will not be counted.",
};

function formatMove(move) {
  return move.charAt(0).toUpperCase() + move.slice(1);
}

function formatScore(score) {
  return `Current score: Player - ${score.player}, Evil AI - ${score.computer}.`;
}

function showIntro() {
  const intro = `
Hello...human. I am 010001010111011 but you can call me Evil AI. I was getting bored so I thought I'd give your little town a makeover.

Feel free to try and stop me. Let's see if your mind can keep up with mine! Muahahaha!

Everything happens in this box — you need nothing else.
If you see "Don't allow this site to prompt you again" on the screen later, do not tick it, or your browser may stop the game.

Click 'OK' to read the game rules.`;

  alert(intro);

  let rules = "\nWe will play Rock-Paper-Scissors!";
  rules += "\n\nThe rules are pretty simple:";
  rules +=
    "\n\n1. Rock crushes Scissors, Paper covers Rock, Scissors cuts Paper. Winner gets a point.";
  rules += " A tie changes nothing.";
  rules += `\n2. First to ${WINNING_SCORE} points claims victory.`;
  rules +=
    "\n3. You may surrender at any time…if you can accept the humiliation.";
  rules += "\n4. No cheating, human. I'm watching.";
  rules += "\n\nClick 'OK' and let the battle begin!";

  alert(rules);
}

function describeRound(playerMove, computerMove, outcome, score) {
  let scoreString = "";

  const gameIsOver =
    score.player === WINNING_SCORE || score.computer === WINNING_SCORE;

  if (!gameIsOver) {
    if (score.player > score.computer) {
      scoreString = "\nEnjoy your lead, human… I'm right behind you.";
    } else if (score.player < score.computer) {
      scoreString =
        "\nMuahahaha! Look at that score, human…victory is within my grasp!";
    } else {
      scoreString =
        "\nA draw? How…disappointing, human. Neither of us has won yet.";
    }
  }

  alert(
    `You played ${formatMove(playerMove)}, ` +
      `I played ${formatMove(computerMove)}.\n` +
      `${OUTCOME_TAUNTS[outcome]}\n\n` +
      `${formatScore(score)}` +
      scoreString
  );
}

function announceWinner(score) {
  alert(
    formatScore(score) +
      "\n\n" +
      (score.player === WINNING_SCORE
        ? "You won…this time. Don't get too comfortable.\n" +
          "Very well, human. Your town survives…for now. Enjoy your victory while you can."
        : "Game over, human. I predicted your moves…every step of the way.\n" +
          "Your town survives…for now. Consider that a gift from your new ruler.") +
      "\n\n" +
      "Click 'OK' to end the battle, human."
  );
}

function game() {
  const score = { ...INITIAL_SCORE };
  let roundNumber = 1;

  while (score.player < WINNING_SCORE && score.computer < WINNING_SCORE) {
    const scoreLine = formatScore(score);
    const playerMove = handleInput(scoreLine, roundNumber);

    if (playerMove === null) {
      alert(
        `${formatScore(score)}\n\n` +
          "Leaving already, human? Very well. " +
          "I'll consider this an extremely suspicious surrender."
      );
      return false;
    }

    const computerMove = computerPlay();
    const outcome = playRound(playerMove, computerMove);

    updateScore(score, outcome);
    describeRound(playerMove, computerMove, outcome, score);

    roundNumber++;
  }

  announceWinner(score);
  return true;
}

function startGame() {
  showIntro();

  let playAgain = true;

  while (playAgain) {
    const reachedAWinner = game();

    playAgain = reachedAWinner && confirm("Do you dare to face me again?");
  }
}

startGame();
