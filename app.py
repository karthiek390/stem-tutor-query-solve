from flask import Flask, request, jsonify, send_file, redirect, url_for, session
from flask_cors import CORS
from wolfram_api import (
    query_short_answer,
    query_spoken_result,
    query_simple_api,
    query_full_results,
    query_llm_api,
    WolframAPIError
)
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os
import io

# Load .env variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev_secret_key")  # Set a secure secret in production
CORS(app, supports_credentials=True, origins=["http://localhost:8080"])

# Google OAuth setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
    question = data.get("query")
    mode = data.get("mode")
    if not question or not mode:
        return jsonify({"error": "Missing 'query' or 'mode' parameter"}), 400

    try:
        if mode == "short_answer":
            answer = query_short_answer(question)
            return jsonify({"answer": answer})
        elif mode == "spoken_result":
            answer = query_spoken_result(question)
            return jsonify({"answer": answer})
        elif mode == "simple":
            image_bytes = query_simple_api(question)
            return send_file(
                io.BytesIO(image_bytes),
                mimetype="image/png",
                as_attachment=False,
                download_name="result.png"
            )
        elif mode == "full":
            answer = query_full_results(question)
            return jsonify({"answer": answer})
        elif mode == "llm":
            answer = query_llm_api(question)
            return jsonify({"answer": answer})
        else:
            return jsonify({"error": f"Unsupported mode: {mode}"}), 400

    except WolframAPIError as e:
        return jsonify({"error": str(e)}), 502

# --- Google OAuth2 routes ---

@app.route("/login")
def login():
    # Get 'next' param from query (default to '/')
    next_url = request.args.get('next', '/')
    session['next_url'] = next_url
    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route("/auth/google/callback")
def google_callback():
    token = google.authorize_access_token()
    user_info = google.get('userinfo').json()
    session['user'] = user_info
    # Get the original next_url (default to "/")
    next_url = session.pop('next_url', '/')
    # Redirect to the correct frontend route
    return redirect(f"http://localhost:8080{next_url}")

@app.route("/logout")
def logout():
    session.pop('user', None)
    return redirect('/')

@app.route("/auth/userinfo")
def userinfo():
    if 'user' in session:
        return jsonify({"authenticated": True, "user": session['user']})
    else:
        return jsonify({"authenticated": False}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)