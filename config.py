import os

WOLFRAM_API_URLS = {
    "full_results": "http://api.wolframalpha.com/v2/query",
    "short_answers": "http://api.wolframalpha.com/v1/result",
    "spoken_results": "http://api.wolframalpha.com/v1/spoken",
    "simple": "http://api.wolframalpha.com/v1/simple",
    "llm": "https://www.wolframalpha.com/api/v1/llm-api",
}

WOLFRAM_APPID = os.getenv("WOLFRAM_APPID")