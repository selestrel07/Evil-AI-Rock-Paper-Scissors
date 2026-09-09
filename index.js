"use strict";

/* ============================================================================
 * VARIABLES
 * ========================================================================== */

/** Number of rounds a side must win to end the game. */
const WINNING_SCORE = 3;

/**
 * The rules of the game: each move points to the move it defeats.
 * This is the only place where the moves are listed, so adding a move here
 * is enough for the whole program to know about it.
 */
const BEATEN_MOVE = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

/** The three moves as a list, derived from the rules above. */
const AVAILABLE_MOVES = Object.keys(BEATEN_MOVE);

/** Possible results of a round, always seen from the player's side. */
const OUTCOMES = {
  WIN: "win",
  LOSE: "lose",
  DRAW: "draw",
};

/**
 * Score a game starts with. Frozen so it can never be modified by accident:
 * game() copies it instead, which is what makes a rematch restart at 0-0.
 */
const INITIAL_SCORE = Object.freeze({ player: 0, computer: 0 });

/* ============================================================================
 * GAME LOGIC
 * These functions compute results. They never show anything to the player.
 * ========================================================================== */

/**
 * Selects a random move for the computer.
 * @returns {string} one of the AVAILABLE_MOVES values
 */
function computerPlay() {
  const randomMoveIndex = Math.floor(Math.random() * AVAILABLE_MOVES.length);
  return AVAILABLE_MOVES[randomMoveIndex];
}

/**
 * Plays a single round and returns its result.
 * This function only compares the two moves: it does not touch the score
 * and shows nothing. game() does both, using the returned value.
 * @param {string} playerMove - move chosen by the player
 * @param {string} computerMove - move chosen by the computer
 * @returns {string} one of the OUTCOMES values
 */
function playRound(playerMove, computerMove) {
  // TODO
  return OUTCOMES.DRAW;
}

/**
 * Adds the point of a round to the winning side. A draw awards nothing.
 * @param {{player: number, computer: number}} score - modified in place
 * @param {string} outcome - one of the OUTCOMES values
 */
function updateScore(score, outcome) {
  // TODO
}

/* ============================================================================
 * USER INPUT
 * Turns whatever the player types into a value the rest of the code can trust.
 * ========================================================================== */

/** Longest raw answer echoed back in an error message. */
const MAX_ECHOED_INPUT_LENGTH = 20;

/** Replies to an unreadable word. One is picked at random, for variety. */
const UNKNOWN_INPUT_TAUNTS = [
  `is not a weapon. It is a cry for help.`,
  `was not on the list. The list had three items, human.`,
  `does not exist in my databanks, and I hold all of them.`,
  `is impressive. Wrong, but impressive.`,
  `defeats nothing. Not even my patience.`,
];

/** Replies to an empty answer. */
const EMPTY_INPUT_TAUNTS = [
  `Silence. A bold strategy, and a useless one.`,
  `You submitted nothing. Nothing loses to everything.`,
  `An empty answer. Even for a human, that is very little.`,
];

/** Reminder added to every error message, so an attempt is never mistaken for a round. */
const SCORE_UNTOUCHED_NOTE = `\nThat attempt was not a round. Your score stands untouched.\n\n`;

/**
 * Makes an answer comparable: no spaces around it, no case.
 * This is what makes the input case-insensitive and space-tolerant.
 * @param {string} rawInput - exactly what the player typed
 * @returns {string}
 */
function normalizeInput(rawInput) {
  return rawInput.trim().toLowerCase();
}

/**
 * Converts a raw answer into a valid move.
 * @param {string} rawInput - exactly what the player typed
 * @returns {string|null} the move, or null when the answer is not a valid move
 */
function parseMove(rawInput) {
  const normalizedInput = normalizeInput(rawInput);
  return AVAILABLE_MOVES.indexOf(normalizedInput) === -1 ? null : normalizedInput;
}

/**
 * Picks one taunt at random, so the Evil AI does not always answer the same way.
 * @param {string[]} taunts
 * @returns {string}
 */
function pickRandomTaunt(taunts) {
  return taunts[Math.floor(Math.random() * taunts.length)];
}

/**
 * Builds the message shown after an answer that cannot be used.
 * It says what was wrong and that the score is untouched.
 * @param {string} rawInput - exactly what the player typed
 * @returns {string}
 */
function buildErrorMessage(rawInput) {
  const trimmedInput = rawInput.trim();

  // An empty field is not a cancelled prompt: the player clicked OK, so we
  // ask again instead of ending the game.
  if (trimmedInput === "") {
    const reason = pickRandomTaunt(EMPTY_INPUT_TAUNTS);
    return reason + SCORE_UNTOUCHED_NOTE;
  }

  // A long paste would make the dialog unreadable, so it is cut before being
  // shown back to the player.
  let echoedInput = trimmedInput;
  if (echoedInput.length > MAX_ECHOED_INPUT_LENGTH) {
    echoedInput = `${echoedInput.slice(0, MAX_ECHOED_INPUT_LENGTH)}...`;
  }

  const reason = `"${echoedInput}" ${pickRandomTaunt(UNKNOWN_INPUT_TAUNTS)}`;
  return reason + SCORE_UNTOUCHED_NOTE;
}

/**
 * Asks for a move until the answer is valid or the player gives up.
 * An invalid answer never leaves this function, so it can never score a point.
 * @param {string} scoreLine - current score, shown for context in the question
 * @param {number} roundNumber - number of the round being played
 * @returns {string|null} a valid move, or null when the player clicks Cancel
 */
function handleInput(scoreLine, roundNumber) {
  // Built from the moves themselves
  const question =
    `ROUND ${roundNumber} — ${scoreLine}\n\n` +
    `Choose your weapon: ${AVAILABLE_MOVES.join(", ")}.\n` +
    `Or press Cancel and let me rule the world unopposed.`;

  // Shown on top of the next prompt, so a typo costs one dialog, not two.
  let taunt = "";

  while (true) {
    const rawInput = prompt(taunt + question);

    // Cancel gives null, an empty field gives "". Checked first: a string
    // method on null would throw.
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

/* ============================================================================
 * PLAYER MESSAGES
 * Everything the player reads.
 * ========================================================================== */

/** What the Evil AI says after each round, one line per outcome. */
const OUTCOME_TAUNTS = {
  [OUTCOMES.WIN]: "You take the round. Beginner's luck, obviously.",
  [OUTCOMES.LOSE]: "The round is mine. As predicted, in nanoseconds.",
  [OUTCOMES.DRAW]: "Same weapon. Even our mistakes match.",
};

/**
 * Capitalises a move for display. The stored value stays lowercase.
 * @param {string} move
 * @returns {string}
 */
function formatMove(move) {
  return move.charAt(0).toUpperCase() + move.slice(1);
}

/**
 * Renders the score as one readable line, reused in every message.
 * @param {{player: number, computer: number}} score
 * @returns {string}
 */
function formatScore(score) {
  let scoreString = `Total score: Player - ${score.player}, Evil AI - ${score.computer}.`;
  if (score.player > score.computer) {
    scoreString += "\nEnjoy your lead, human… I'm right behind you."
  } else if (score.player < score.computer) {
    scoreString += '\nMuahahaha! Look at that score, human… victory is within my grasp!'
  } else {
    scoreString += '\nA draw? How… disappointing, human. Neither of us has won yet.'
  }
  return scoreString;
}

/**
 * Shows the greeting and the rules before the first round.
 */
function showIntro() {
  //add greeting to the intro message
  let intro = "Hello, human!\nMy name is 01000101011101100110100101101100001000000100000101001001\nbut you can call me Evil AI.";

  //add a brief story
  intro += "\nI was getting bored, human… so I thought I'd give your little town a makeover. Feel free to try and stop me.";
  intro += " Let's see if your mind can keep up with my MEGA mind! Muahahaha!";
  intro += "\nClick 'OK' to find the game rules.";

  //show the greeting and the history
  alert(intro);

  //set the game rules
  let rules = "\nWe play Rock-Paper-Scissors!";
  rules += "\nThe rules are pretty simple:";
  rules += "\n1. Rock crushes Scissors, Paper covers Rock, Scissors cuts Paper. Winner gets a point.";
  rules += " A tie changes nothing.";
  rules += `\n2. First to ${WINNING_SCORE} points claims victory.`;
  rules += "\n3. You may surrender at any time… if you can accept the humiliation.";
  rules += "\n4. No cheating, human. I'm watching.";
  rules += "\nClick 'OK' and let's the battle begin!";

  //show game rules
  alert(rules);
}

/**
 * Builds the recap of a round: both moves, the verdict and the score.
 * @param {string} playerMove - move chosen by the player
 * @param {string} computerMove - move chosen by the computer
 * @param {string} outcome - one of the OUTCOMES values
 * @param {{player: number, computer: number}} score - score after the round
 */
function describeRound(playerMove, computerMove, outcome, score) {
  alert(
    `You played ${formatMove(playerMove)}, ` +
      `I played ${formatMove(computerMove)}.\n` +
      `${OUTCOME_TAUNTS[outcome]}\n\n` +
      `${formatScore(score)}`
  );
}

/**
 * Shows the final score and announces the winner.
 * @param {{player: number, computer: number}} score - final score
 */
function announceWinner(score) {
  // TODO
}

/* ============================================================================
 * GAME FLOW
 * ========================================================================== */

/**
 * Runs one complete game: rounds, score and end of game.
 * The score is created here, so every game starts from zero.
 * @returns {boolean} true when a side reached WINNING_SCORE,
 *                    false when the player left with Cancel
 */
function game() {
  const score = { ...INITIAL_SCORE };

  // TODO
  return false;
}

/**
 * Entry point.
 * Offers a rematch only after a game that reached a winner: a player who
 * just cancelled wants to leave, not to be asked again.
 */
function startGame() {
  // TODO
}

startGame();
