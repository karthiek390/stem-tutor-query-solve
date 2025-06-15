import requests
from urllib.parse import urlencode
from config import WOLFRAM_API_URLS, WOLFRAM_APPID

class WolframAPIError(Exception):
    pass

def query_short_answer(question, units=None, timeout=None):
    """
    Calls the Wolfram|Alpha Short Answers API and returns the result as plain text.
    Raises WolframAPIError on failure.
    """
    params = {
        "appid": WOLFRAM_APPID,
        "i": question,
    }
    if units:
        params["units"] = units
    if timeout:
        params["timeout"] = timeout

    url = WOLFRAM_API_URLS["short_answers"]
    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.text.strip()
    elif response.status_code == 501:
        raise WolframAPIError("Input could not be interpreted or no short result found.")
    elif response.status_code == 400:
        raise WolframAPIError("Missing or malformed input parameter.")
    elif "Error 1" in response.text:
        raise WolframAPIError("Invalid appid. Please check your AppID.")
    elif "Error 2" in response.text:
        raise WolframAPIError("Appid missing. Please check your configuration.")
    else:
        raise WolframAPIError(f"Unexpected error: {response.status_code} - {response.text}")


def query_spoken_result(question, units=None, timeout=None):
    """
    Calls the Wolfram|Alpha Spoken Results API and returns the result as plain text.
    Raises WolframAPIError on failure.
    """
    params = {
        "appid": WOLFRAM_APPID,
        "i": question,
    }
    if units:
        params["units"] = units
    if timeout:
        params["timeout"] = timeout

    url = WOLFRAM_API_URLS["spoken_results"]
    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.text.strip()
    elif response.status_code == 501:
        raise WolframAPIError("Input could not be interpreted or no spoken result found.")
    elif response.status_code == 400:
        raise WolframAPIError("Missing or malformed input parameter.")
    elif "Error 1" in response.text:
        raise WolframAPIError("Invalid appid. Please check your AppID.")
    elif "Error 2" in response.text:
        raise WolframAPIError("Appid missing. Please check your configuration.")
    else:
        raise WolframAPIError(f"Unexpected error: {response.status_code} - {response.text}")


def query_simple_api(
    question,
    units=None,
    timeout=None,
    layout=None,
    background=None,
    foreground=None,
    fontsize=None,
    width=None,
):
    """
    Calls the Wolfram|Alpha Simple API and returns the image content (bytes).
    Raises WolframAPIError on failure.
    """
    params = {
        "appid": WOLFRAM_APPID,
        "i": question,
    }
    if units:
        params["units"] = units
    if timeout:
        params["timeout"] = timeout
    if layout:
        params["layout"] = layout
    if background:
        params["background"] = background
    if foreground:
        params["foreground"] = foreground
    if fontsize:
        params["fontsize"] = fontsize
    if width:
        params["width"] = width

    url = WOLFRAM_API_URLS["simple"]
    response = requests.get(url, params=params, stream=True)

    if response.status_code == 200 and "image" in response.headers.get("Content-Type", ""):
        return response.content  # return raw image bytes
    elif response.status_code == 501:
        raise WolframAPIError("Input could not be interpreted or no simple image result found.")
    elif response.status_code == 400:
        raise WolframAPIError("Missing or malformed input parameter.")
    elif "Error 1" in response.text:
        raise WolframAPIError("Invalid appid. Please check your AppID.")
    elif "Error 2" in response.text:
        raise WolframAPIError("Appid missing. Please check your configuration.")
    else:
        raise WolframAPIError(f"Unexpected error: {response.status_code} - {response.text}")


def query_full_results(question, units=None, timeout=None):
    """
    Calls the Wolfram|Alpha Full Results API and returns a plain-text summary.
    You can expand this to return more detailed or formatted results.
    """
    params = {
        "appid": WOLFRAM_APPID,
        "input": question,
        "output": "JSON"
    }
    if units:
        params["units"] = units
    if timeout:
        params["timeout"] = timeout

    url = WOLFRAM_API_URLS["full_results"]
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise WolframAPIError(f"Full Results API error: {response.status_code} - {response.text}")

    data = response.json()
    try:
        pods = data["queryresult"]["pods"]
        # Concatenate all pod plaintexts
        result_texts = []
        for pod in pods:
            for sub in pod.get("subpods", []):
                text = sub.get("plaintext")
                if text:
                    result_texts.append(f"**{pod.get('title','')}**:\n{text}")
        if not result_texts:
            raise WolframAPIError("No results found in Full Results API response.")
        return "\n\n".join(result_texts)
    except Exception as e:
        raise WolframAPIError(f"Failed to parse Full Results API response: {e}")


def query_llm_api(question, maxchars=None):
    """
    Calls the Wolfram|Alpha LLM API and returns the result as plain text.
    Raises WolframAPIError on failure.
    """
    params = {
        "appid": WOLFRAM_APPID,
        "input": question,
    }
    if maxchars:
        params["maxchars"] = maxchars

    url = WOLFRAM_API_URLS["llm"]
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.text.strip()
    elif response.status_code == 501:
        raise WolframAPIError("Input could not be interpreted or no LLM result found.")
    elif response.status_code == 400:
        raise WolframAPIError("Missing or malformed input parameter.")
    elif response.status_code == 403:
        if "Invalid appid" in response.text:
            raise WolframAPIError("Invalid appid. Please check your AppID.")
        elif "appid missing" in response.text.lower():
            raise WolframAPIError("Appid missing. Please check your configuration.")
        else:
            raise WolframAPIError("Forbidden: Check your AppID and configuration.")
    else:
        raise WolframAPIError(f"Unexpected error: {response.status_code} - {response.text}")