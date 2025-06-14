# Wolfram STEM Tutor

Wolfram STEM Tutor is an AI-powered question-answering web application that helps K-12 students solve math and science questions using the computational power of Wolfram Alpha. The project consists of a React frontend and a Flask backend that acts as a proxy to the Wolfram Alpha API.

---

## Features

- **Ask Math and Science Questions:** Type your question and receive step-by-step solutions powered by Wolfram Alpha.
- **Modern UI:** Built with React and Tailwind CSS for a clean and responsive design.
- **API Proxy:** The backend securely communicates with Wolfram Alpha, keeping your API key safe.
- **Easy Local Setup:** Run both frontend and backend locally for quick testing and development.
- **Environment Variables:** Securely manage sensitive credentials like your Wolfram Alpha App ID using a `.env` file.

---

## Project Structure

```
stem-tutor-query-solve/
├── app.py                # Flask backend (API proxy)
├── requirements.txt      # Backend Python dependencies
├── .env                  # Backend environment variables (NOT committed)
├── .gitignore            # Files/directories to ignore in git (including .env)
├── package.json          # Frontend project configuration
├── vite.config.ts        # Vite config (frontend dev server & proxy)
├── src/                  # Frontend React application source code
└── ...                   # Other supporting files
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Python](https://www.python.org/) (v3.8+)
- [pip](https://pip.pypa.io/en/stable/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/karthiek390/stem-tutor-query-solve.git
cd stem-tutor-query-solve
```

...
### 2. Backend Setup (Flask + Wolfram Alpha API)

#### a. Create and Activate a Python Virtual Environment

**On Windows (cmd):**
```cmd
python -m venv venv
venv\Scripts\activate
```
**On Windows (PowerShell):**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```
**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### b. Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### c. Configure Environment Variables

1. Copy the example environment file to create your own `.env`:
    ```bash
    cp .env.example .env
    ```
    On Windows, use:
    ```cmd
    copy .env.example .env
    ```

2. Open the new `.env` file and replace `YOUR-WOLFRAM-APP-ID-HERE` with your actual Wolfram Alpha App ID.

3. **Do not commit your `.env` file to git!**  
   Your `.env` file is already included in `.gitignore` for safety.

#### d. Start the Flask Backend

```bash
python app.py
```
The backend will start on [http://localhost:5000](http://localhost:5000).
...

### 3. Frontend Setup (React)

#### a. Install Node.js dependencies

```bash
npm install
```

#### b. Start the frontend development server

```bash
npm run dev
```
The frontend will start on [http://localhost:8080](http://localhost:8080) (see your terminal for the exact port).

---

### 4. Usage

- Open your browser and go to [http://localhost:8080](http://localhost:8080).
- Type your question in the provided input box.
- Press "Get Answer" to see the solution fetched from Wolfram Alpha.

---

### 5. Notes

- The frontend is configured (via `vite.config.ts`) to proxy API requests to the Flask backend, so no CORS issues will occur during local development.
- Ensure both the frontend and backend are running simultaneously for the application to function.
- The backend uses a `.env` file for secrets. If you share this project, never share your actual `.env` file or API keys.

---

## Troubleshooting

- **CORS or Network Errors:** Make sure both servers are running and the ports match those in your configuration files.
- **Wolfram Alpha API errors:** Check your internet connection and ensure the App ID in `.env` is valid.
- **Dependency issues:** Ensure you are using compatible versions of Python and Node.js. Always use a virtual environment for Python dependencies.
- **Virtual environment not activating:** Double-check activation commands for your OS/terminal. See step 2a above.

---

## License

This project is for educational purposes.

---

## Credits

Developed by [karthiek390](https://github.com/karthiek390).