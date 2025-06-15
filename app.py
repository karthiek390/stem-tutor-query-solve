from flask import Flask, request, jsonify, send_file
from wolfram_api import (
    query_short_answer,
    query_spoken_result,
    query_simple_api,
    query_full_results,
    query_llm_api,
    WolframAPIError
)
import io

app = Flask(__name__)

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
            # You can add more parameters as needed (units, timeout, layout, etc.)
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

if __name__ == "__main__":
    app.run(debug=True)