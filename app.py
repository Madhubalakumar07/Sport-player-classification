from flask import Flask, jsonify, render_template, request

import util


app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024   # 50 MB


util.load_saved_artifacts()
PLAYER_METADATA = util.get_player_metadata()


@app.route("/")
def home():
    return render_template(
        "index.html",
        players=PLAYER_METADATA,
        player_count=len(PLAYER_METADATA),
    )


@app.route("/classify_image", methods=["POST"])
def classify_image():
    image_data = request.form.get("image_data")

    result = util.classify_image(image_base64_data=image_data)

    response = jsonify(result)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


if __name__ == "__main__":
    print("Starting Flask Server")
    app.run(
        debug=False,
        host="127.0.0.1",
        port=5000
    )