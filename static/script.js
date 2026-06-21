const state = {
    file: null,
    imageData: null,
};

function sanitizeKey(key) {
    return key.replace(/\s+/g, "_");
}

function getElements() {
    return {
        dropZone: document.getElementById("dropZone"),
        imageInput: document.getElementById("imageInput"),
        previewImage: document.getElementById("previewImage"),
        previewPlaceholder: document.getElementById("previewPlaceholder"),
        classifyButton: document.getElementById("classifyButton"),
        resetButton: document.getElementById("resetButton"),
        statusLine: document.getElementById("statusLine"),
        error: document.getElementById("error"),
        resultHolder: document.getElementById("resultHolder"),
        predictionTitle: document.getElementById("predictionTitle"),
        predictionConfidence: document.getElementById("predictionConfidence"),
        predictionCard: document.getElementById("predictionCard"),
        selectedFileName: document.getElementById("selectedFileName"),
        playerCards: Array.from(document.querySelectorAll(".player-card")),
    };
}

function setHidden(element, shouldHide) {
    element.classList.toggle("is-hidden", shouldHide);
}

function clearScoreboard() {
    document.querySelectorAll("[id^='score_']").forEach((element) => {
        element.textContent = "--";
    });

    document.querySelectorAll("[id^='bar_']").forEach((element) => {
        element.style.width = "0%";
    });
}

function clearHighlights(elements) {
    elements.playerCards.forEach((card) => card.classList.remove("is-active"));
}

function resetPrediction(elements) {
    elements.resultHolder.classList.add("is-hidden");
    elements.predictionTitle.textContent = "Awaiting analysis";
    elements.predictionConfidence.textContent = "--";
    elements.predictionCard.innerHTML = "";
    clearHighlights(elements);
}

function setStatus(elements, message, tone = "idle") {
    elements.statusLine.textContent = message;
    elements.statusLine.dataset.tone = tone;
}

function showError(elements, message) {
    elements.error.textContent = message;
    setHidden(elements.error, false);
}

function hideError(elements) {
    setHidden(elements.error, true);
}

function setPreview(elements, dataUrl, fileName) {
    elements.previewImage.src = dataUrl;
    setHidden(elements.previewImage, false);
    setHidden(elements.previewPlaceholder, true);
    elements.selectedFileName.textContent = fileName;
}

function readFileAsDataUrl(file) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        const reader = new FileReader();

        reader.onload = (e) => {

            img.src = e.target.result;
        };

        img.onload = () => {

            const canvas = document.createElement("canvas");

            const maxDimension = 600;

            let width = img.width;

            let height = img.height;

            if (width > height) {

                if (width > maxDimension) {

                    height = height * (maxDimension / width);

                    width = maxDimension;
                }

            } else {

                if (height > maxDimension) {

                    width = width * (maxDimension / height);

                    height = maxDimension;
                }
            }

            canvas.width = width;

            canvas.height = height;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );

            resolve(
                canvas.toDataURL(
                    "image/jpeg",
                    0.8
                )
            );
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}

function chooseBestMatch(data) {
    let bestMatch = null;
    let bestScore = -1;

    data.forEach((item) => {
        const itemScore = Math.max(...item.class_probability);

        if (itemScore > bestScore) {
            bestMatch = item;
            bestScore = itemScore;
        }
    });

    return { bestMatch, bestScore };
}

function updateScoreboard(match) {
    const classDictionary = match.class_dictionary;

    Object.keys(classDictionary).forEach((playerName) => {
        const index = classDictionary[playerName];
        const probabilityScore = match.class_probability[index];
        const scoreElement = document.getElementById(`score_${sanitizeKey(playerName)}`);
        const barElement = document.getElementById(`bar_${sanitizeKey(playerName)}`);

        if (scoreElement) {
            scoreElement.textContent = `${probabilityScore.toFixed(2)}%`;
        }

        if (barElement) {
            barElement.style.width = `${Math.max(probabilityScore, 0)}%`;
        }
    });
}

function showPrediction(elements, match, bestScore) {
    const sourceCard = document.querySelector(`[data-player="${match.class}"]`);

    if (!sourceCard) {
        return;
    }

    const clonedCard = sourceCard.cloneNode(true);
    clonedCard.classList.add("player-card--featured");

    elements.predictionCard.replaceChildren(clonedCard);
    elements.predictionTitle.textContent = clonedCard.querySelector(".player-card__name").textContent;
    elements.predictionConfidence.textContent = `${bestScore.toFixed(2)}% confidence`;
    elements.resultHolder.classList.remove("is-hidden");
    sourceCard.classList.add("is-active");
}

async function classifyImage(elements) {
    if (!state.imageData) {
        setStatus(elements, "Select an image before classifying it.", "warning");
        return;
    }

    hideError(elements);
    setStatus(elements, "Classifying image...", "loading");
    elements.classifyButton.disabled = true;

    try {
        const formData = new FormData();
        formData.append("image_data", state.imageData);

        const response = await fetch("/classify_image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Server returned an error while classifying the image.");
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            resetPrediction(elements);
            clearScoreboard();
            showError(elements, "The classifier could not detect a usable face with two eyes.");
            setStatus(elements, "No valid face was detected.", "warning");
            return;
        }

        const { bestMatch, bestScore } = chooseBestMatch(data);

        if (!bestMatch) {
            resetPrediction(elements);
            clearScoreboard();
            showError(elements, "The classifier did not return a prediction.");
            setStatus(elements, "No prediction available.", "warning");
            return;
        }

        clearScoreboard();
        updateScoreboard(bestMatch);
        resetPrediction(elements);
        showPrediction(elements, bestMatch, bestScore);
        setStatus(elements, `Prediction ready: ${bestMatch.class.replace(/\b\w/g, (letter) => letter.toUpperCase())}`, "success");
    } catch (error) {
        console.error(error);
        resetPrediction(elements);
        showError(elements, "Could not classify the image. Please try a different photo.");
        setStatus(elements, "Classification failed.", "warning");
    } finally {
        elements.classifyButton.disabled = false;
    }
}

function handleFiles(elements, fileList) {
    const [file] = fileList;

    if (!file) {
        return;
    }

    state.file = file;

    readFileAsDataUrl(file)
        .then((dataUrl) => {
            state.imageData = dataUrl;
            setPreview(elements, dataUrl, file.name);
            hideError(elements);
            setStatus(elements, `Loaded ${file.name}. Ready to classify.`, "ready");
            resetPrediction(elements);
            clearScoreboard();
        })
        .catch((error) => {
            console.error(error);
            showError(elements, "The selected file could not be loaded.");
            setStatus(elements, "File load failed.", "warning");
        });
}

function wireDragAndDrop(elements) {
    elements.dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        elements.dropZone.classList.add("is-dragover");
    });

    elements.dropZone.addEventListener("dragleave", () => {
        elements.dropZone.classList.remove("is-dragover");
    });

    elements.dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        elements.dropZone.classList.remove("is-dragover");
        handleFiles(elements, event.dataTransfer.files);
    });
}

function resetApp(elements) {
    state.file = null;
    state.imageData = null;
    elements.imageInput.value = "";
    elements.previewImage.src = "";
    setHidden(elements.previewImage, true);
    setHidden(elements.previewPlaceholder, false);
    elements.selectedFileName.textContent = "No file selected";
    hideError(elements);
    clearScoreboard();
    resetPrediction(elements);
    setStatus(elements, "Ready when you are.", "idle");
}

function init() {
    const elements = getElements();

    if (!elements.dropZone) {
        return;
    }

    resetApp(elements);
    wireDragAndDrop(elements);

    elements.imageInput.addEventListener("change", (event) => {
        handleFiles(elements, event.target.files);
    });

    elements.classifyButton.addEventListener("click", () => {
        classifyImage(elements);
    });

    elements.resetButton.addEventListener("click", () => {
        resetApp(elements);
    });
}

document.addEventListener("DOMContentLoaded", init);