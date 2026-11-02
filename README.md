# MCMC Cipher Cracker — Interactive Portfolio Showcase

An interactive, client-side implementation of the **Metropolis–Hastings Markov Chain Monte Carlo (MCMC)** algorithm for cracking classical substitution ciphers, inspired by the research of Persi Diaconis and Jeffrey S. Rosenthal.

---

## 🚀 Live Preview Locally

You don't need to install any frameworks, Node.js, or dependencies.

To open the interactive landing page on your Mac:
1. In Finder or Terminal, run:
   ```bash
   cd ~/.gemini/antigravity/scratch/mcmc-cipher-cracker
   open index.html
   ```
2. Or start a quick local server:
   ```bash
   python3 -m http.server 8080
   ```
   and visit `http://localhost:8080` in your browser.

---

## 🌐 How to Put This on GitHub Pages (Step-by-Step)

GitHub Pages gives you a free public website link (`https://<username>.github.io/<repo-name>`).

### Step 1: Create a new repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Repository name: `mcmc-cipher-cracker`.
3. Set visibility to **Public**.
4. Click **Create repository**.

### Step 2: Push this folder to your repository
In your terminal, run these commands:
```bash
cd ~/.gemini/antigravity/scratch/mcmc-cipher-cracker
git init
git add .
git commit -m "Initial commit: interactive MCMC cipher cracker landing page"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/mcmc-cipher-cracker.git
git push -u origin main
```
*(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username).*

### Step 3: Turn on GitHub Pages (Takes 10 seconds)
1. In your GitHub repository, click on **Settings** (top menu).
2. On the left sidebar, click **Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Within 1 minute, GitHub will give you a live URL:
   `https://YOUR_GITHUB_USERNAME.github.io/mcmc-cipher-cracker/`

---

## 📝 How to Put This in Notion

Once your GitHub Pages link is live:
1. Open your portfolio page in Notion.
2. Click anywhere on the page and type:
   `/embed`
3. Hit Enter.
4. Paste your live GitHub Pages link:
   `https://YOUR_GITHUB_USERNAME.github.io/mcmc-cipher-cracker/`
5. Click **Embed link**.
6. Notion will now display the fully interactive, playable cipher cracker right inside your document!

---

## 🧠 How the Algorithm Works

1. **The Brute Force Impossibility**:
   A monoalphabetic substitution cipher maps the 26 letters of the English alphabet. The total number of permutations is $26! \approx 4.03 \times 10^{26}$. A supercomputer testing 1 billion keys per second would take 12 billion years to brute-force all combinations.

2. **Metropolis–Hastings Random Walk**:
   Instead of testing blindly, we define a stationary probability distribution $\pi(f)$ based on the character pair (bigram) frequencies of English:
   $$\text{LogScore}(f) = \sum_{i=1}^{N-1} \log M(f(c_i), f(c_{i+1}))$$
   where $M$ is the $27 \times 27$ transition matrix trained on *War and Peace* (A-Z and space).

3. **Acceptance Criterion**:
   At each step, we propose swapping two letters in key $f \to f'$.
   - If $\Delta \text{LogScore} > 0$, the key produces more English-like bigrams $\to$ **Accept**.
   - If $\Delta \text{LogScore} \le 0$, we accept with probability $\exp(\Delta \text{LogScore} / T)$ to escape local minima.
