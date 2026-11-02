An interactive, client-side implementation of the **Metropolis–Hastings Markov Chain Monte Carlo (MCMC)** algorithm for cracking classical substitution ciphers, inspired by the research of  Diaconis and Jeffrey S. Rosenthal.


## How the Algorithm Works

1. A monoalphabetic substitution cipher maps the 26 letters of the English alphabet. The total number of permutations is $26! \approx 4.03 \times 10^{26}$. A supercomputer testing 1 billion keys per second would take 12 billion years to brute-force all combinations.

2. Instead of testing blindly, we define a stationary probability distribution $\pi(f)$ based on the character pair (bigram) frequencies of English:
   $$\text{LogScore}(f) = \sum_{i=1}^{N-1} \log M(f(c_i), f(c_{i+1}))$$
   where $M$ is the $27 \times 27$ transition matrix trained on *War and Peace* (A-Z and space).

3. At each step, we propose swapping two letters in key $f \to f'$.
   - If $\Delta \text{LogScore} > 0$, the key produces more English-like bigrams $\to$ **Accept**.
   - If $\Delta \text{LogScore} \le 0$, we accept with probability $\exp(\Delta \text{LogScore} / T)$ to escape local minima.
