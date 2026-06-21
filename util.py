import base64
import json
import cv2
import joblib
import numpy as np
from pathlib import Path

from wavelet import w2d


BASE_DIR = Path(__file__).resolve().parent

PLAYER_IMAGE_FILES = {
    "charles leclerc": "charles leclerc.jpg",
    "dhoni": "dhoni.jpg",
    "lewis hamilton": "lewis hamilton.png",
    "lionel messi": "messi.jpg",
    "max verstappen": "max verstappen.jpg",
    "neymar": "neymar.jpg",
    "rohit sharma": "rohit sharma.jpg",
    "ronaldo": "ronaldo.jpg",
    "virat kohli": "virat kholi.jpg",
}

__class_name_to_number = {}
__class_number_to_name = {}

__model = None


def _resolve_artifact_file(*relative_paths):
    for relative_path in relative_paths:
        candidate_path = BASE_DIR / relative_path
        if candidate_path.exists():
            return candidate_path

    raise FileNotFoundError(
        f"Unable to locate any of the requested artifacts: {relative_paths}"
    )


def _load_json_artifact(*relative_paths):
    artifact_path = _resolve_artifact_file(*relative_paths)

    with open(artifact_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_model_artifact(*relative_paths):
    artifact_path = _resolve_artifact_file(*relative_paths)

    with open(artifact_path, "rb") as f:
        return joblib.load(f)


def _load_cascade_classifier(file_name):
    candidate_paths = [
        BASE_DIR / "opencv" / "haarcascades" / file_name,
        Path(cv2.data.haarcascades) / file_name,
    ]

    for candidate_path in candidate_paths:
        if candidate_path.exists():
            cascade = cv2.CascadeClassifier(str(candidate_path))
            if not cascade.empty():
                return cascade

    raise FileNotFoundError(
        f"Unable to load OpenCV cascade file: {file_name}"
    )


def load_saved_artifacts():

    global __class_name_to_number
    global __class_number_to_name
    global __model

    print("Loading artifacts...")

    __class_name_to_number = _load_json_artifact(
        Path("artifacts") / "names_scale.json",
        Path("artifacts") / "class_dictionary.json",
    )

    __class_number_to_name = {
        v: k
        for k, v in __class_name_to_number.items()
    }

    model_path = _resolve_artifact_file(
        Path("artifacts") / "celebrity_classification_model.pkl",
        Path("artifacts") / "saved_model.pkl",
    )

    print("Loading model from:", model_path)

    __model = joblib.load(model_path)

    print(type(__model))

    print("Artifacts loaded")


def class_number_to_name(class_num):
    return __class_number_to_name[int(class_num)]


def get_player_metadata():
    if not __class_name_to_number:
        load_saved_artifacts()

    player_rows = []

    for player_name, class_number in sorted(
        __class_name_to_number.items(),
        key=lambda item: item[1],
    ):
        player_rows.append(
            {
                "key": player_name,
                "display_name": player_name.title(),
                "class_num": class_number,
                "image": f"images/{PLAYER_IMAGE_FILES.get(player_name)}" if PLAYER_IMAGE_FILES.get(player_name) else None,
            }
        )

    return player_rows


def get_cv2_image_from_base64_string(b64str):

    if not b64str:

        return None

    encoded_data = b64str.split(",")[1]

    nparr = np.frombuffer(

        base64.b64decode(encoded_data),

        np.uint8

    )

    img = cv2.imdecode(

        nparr,

        cv2.IMREAD_COLOR

    )

    return img


def get_cropped_image_if_2_eyes(

        image_path=None,

        image_base64_data=None

):

    face_cascade = _load_cascade_classifier("haarcascade_frontalface_default.xml")

    eye_cascade = _load_cascade_classifier("haarcascade_eye.xml")

    if image_path:

        img = cv2.imread(image_path)

    else:

        img = get_cv2_image_from_base64_string(

            image_base64_data

        )

    if img is None:
        return []

    gray = cv2.cvtColor(

        img,

        cv2.COLOR_BGR2GRAY

    )

    faces = face_cascade.detectMultiScale(

        gray,

        1.3,

        5

    )

    cropped_faces = []

    for (x, y, w, h) in faces:

        roi_gray = gray[y:y+h, x:x+w]

        roi_color = img[y:y+h, x:x+w]

        eyes = eye_cascade.detectMultiScale(

            roi_gray

        )

        if len(eyes) >= 2:

            cropped_faces.append(

                roi_color

            )

    return cropped_faces


def classify_image(

        image_base64_data=None,

        file_path=None

):

    if not image_base64_data and not file_path:

        return []

    imgs = get_cropped_image_if_2_eyes(

        file_path,

        image_base64_data

    )

    results = []

    for img in imgs:

        scaled_raw = cv2.resize(

            img,

            (32, 32)

        )

        wavelet_img = w2d(

            img,

            'db1',

            5

        )

        scaled_wavelet = cv2.resize(

            wavelet_img,

            (32, 32)

        )

        combined = np.vstack((

            scaled_raw.reshape(

                32*32*3,

                1

            ),

            scaled_wavelet.reshape(

                32*32,

                1

            )

        ))

        final = combined.reshape(

            1,

            4096

        ).astype(float)

        prediction = __model.predict(

            final

        )[0]

        probability = np.around(

            __model.predict_proba(

                final

            )[0] * 100,

            2

        ).tolist()

        results.append({

            "class": class_number_to_name(

                prediction

            ),

            "class_probability": probability,

            "class_dictionary": __class_name_to_number

        })

    return results


if __name__ == "__main__":

    load_saved_artifacts()