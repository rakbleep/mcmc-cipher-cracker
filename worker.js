/**
 * MCMC Cipher Cracker - Web Worker
 * Runs the Metropolis-Hastings Markov Chain Monte Carlo sampler in a background thread.
 */

let matrix = null;
let ciphertext = '';
let plaintext = '';
let testCounts = Array.from({ length: 27 }, () => new Int32Array(27));

let f = Array.from({ length: 27 }, (_, i) => i);
let bestKey = [...f];
let currentScore = 0;
let bestScore = -Infinity;

let iteration = 0;
let totalAccepted = 0;
let isRunning = false;
let timerId = null;
let maxIterations = 15000;
let itersPerBatch = 100;
let temperature = 1.0;
let startTime = 0;

function charToIdx(c) {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return code - 65; // A-Z
  if (code >= 97 && code <= 122) return code - 97; // a-z
  return 26; // space or non-alpha
}

function calculateScore(key) {
  let score = 0;
  for (let a = 0; a < 27; a++) {
    for (let b = 0; b < 27; b++) {
      if (testCounts[a][b] > 0) {
        score += testCounts[a][b] * matrix[key[a]][key[b]];
      }
    }
  }
  return score;
}

function runBatch() {
  if (!isRunning) return;

  const batchLimit = Math.min(iteration + itersPerBatch, maxIterations);

  while (iteration < batchLimit) {
    iteration++;

    // Propose swapping two random letters in the substitution cipher
    const a = Math.floor(Math.random() * 26);
    const b = Math.floor(Math.random() * 26);
    if (a === b) continue;

    // Swap
    const temp = f[a];
    f[a] = f[b];
    f[b] = temp;

    const newScore = calculateScore(f);
    const delta = (newScore - currentScore) / temperature;

    // Metropolis-Hastings acceptance criterion
    if (delta > 0 || Math.random() < Math.exp(delta)) {
      currentScore = newScore;
      totalAccepted++;
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestKey = [...f];
      }
    } else {
      // Revert swap
      f[b] = f[a];
      f[a] = temp;
    }
  }

  const elapsed = Date.now() - startTime;
  const acceptanceRate = iteration > 0 ? totalAccepted / iteration : 0;

  self.postMessage({
    type: 'tick',
    iteration,
    currentScore,
    bestScore,
    currentKey: [...f],
    bestKey: [...bestKey],
    acceptanceRate,
    elapsedMs: elapsed,
    isComplete: iteration >= maxIterations
  });

  if (iteration >= maxIterations) {
    isRunning = false;
  } else if (isRunning) {
    // Schedule next batch
    timerId = setTimeout(runBatch, 0);
  }
}

self.onmessage = function (e) {
  const data = e.data;
  switch (data.type) {
    case 'init': {
      matrix = data.matrix;
      ciphertext = data.ciphertext;
      plaintext = data.plaintext || '';
      maxIterations = data.maxIterations || 15000;
      itersPerBatch = data.itersPerBatch || 100;
      temperature = data.temperature || 1.0;

      // Reset frequency counts for ciphertext
      for (let i = 0; i < 27; i++) {
        testCounts[i].fill(0);
      }
      for (let i = 0; i < ciphertext.length - 1; i++) {
        const c1 = charToIdx(ciphertext[i]);
        const c2 = charToIdx(ciphertext[i + 1]);
        testCounts[c1][c2]++;
      }

      // Reset state
      f = Array.from({ length: 27 }, (_, i) => i);
      currentScore = calculateScore(f);
      bestScore = currentScore;
      bestKey = [...f];
      iteration = 0;
      totalAccepted = 0;
      isRunning = false;
      if (timerId) clearTimeout(timerId);

      self.postMessage({
        type: 'initialized',
        initialScore: currentScore,
        currentKey: [...f]
      });
      break;
    }

    case 'start': {
      if (isRunning) return;
      if (iteration >= maxIterations) {
        // restart if finished
        iteration = 0;
        totalAccepted = 0;
        f = Array.from({ length: 27 }, (_, i) => i);
        currentScore = calculateScore(f);
        bestScore = currentScore;
        bestKey = [...f];
      }
      if (data.itersPerBatch) itersPerBatch = data.itersPerBatch;
      if (data.temperature) temperature = data.temperature;
      isRunning = true;
      startTime = Date.now() - (data.resumedElapsed || 0);
      runBatch();
      break;
    }

    case 'pause': {
      isRunning = false;
      if (timerId) clearTimeout(timerId);
      break;
    }

    case 'step': {
      if (isRunning) isRunning = false;
      if (timerId) clearTimeout(timerId);
      if (iteration < maxIterations) {
        itersPerBatch = 50;
        isRunning = true;
        startTime = Date.now();
        runBatch();
        isRunning = false;
      }
      break;
    }

    case 'setParams': {
      if (data.itersPerBatch) itersPerBatch = data.itersPerBatch;
      if (data.temperature) temperature = data.temperature;
      break;
    }
  }
};
