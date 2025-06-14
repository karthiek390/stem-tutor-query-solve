from flask import Flask, request, jsonify
from dotenv import load_dotenv
import requests
import os

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

WOLFRAM_APP_ID = os.getenv('WOLFRAM_APP_ID')

if WOLFRAM_APP_ID is None:
    raise ValueError("WOLFRAM_APP_ID not set in environment variables or .env file.")

WOLFRAM_API_URL = "http://api.wolframalpha.com/v2/query"

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    if not data or "query" not in data:
        return jsonify({"error": "Missing 'query' in request body"}), 400

    query = data["query"]

    params = {
        "appid": WOLFRAM_APP_ID,
        "input": query,
        "output": "json",
        "format": "plaintext"
    }

    try:
        response = requests.get(WOLFRAM_API_URL, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        return jsonify({"error": f"Request to Wolfram Alpha failed: {str(e)}"}), 502

    try:
        result = response.json()
    except Exception:
        return jsonify({"error": "Invalid JSON received from Wolfram Alpha"}), 502

    pods = result.get("queryresult", {}).get("pods", [])
    answer_parts = []
    for pod in pods:
        subpods = pod.get("subpods", [])
        for subpod in subpods:
            text = subpod.get("plaintext", "")
            if text:
                answer_parts.append(text)
    answer = "\n\n".join(answer_parts) if answer_parts else "No answer found."

    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)