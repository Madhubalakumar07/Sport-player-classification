# 🏆 Sports Player Image Classification

An end-to-end Machine Learning web application that classifies sports players from uploaded images using image processing techniques and supervised learning.

The project uses OpenCV for face detection, wavelet transforms for feature extraction, and Scikit-learn for classification. The web interface is built using Flask and deployed using Render.

---

## 🚀 Live Demo

Add your deployed Render URL here:

https://sport-player-classification.onrender.com/

---

## 📌 Features

- Upload an image from your device
- Automatic face detection
- Wavelet transformation for feature extraction
- Predicts the sports player
- Displays prediction confidence scores
- Interactive and responsive user interface
- End-to-end ML deployment using Flask

---

## 🏅 Players Included

The model currently classifies the following players:

### ⚽ Football

- Lionel Messi
- Cristiano Ronaldo
- Neymar Jr

### 🏏 Cricket

- MS Dhoni
- Virat Kohli
- Rohit Sharma

### 🏎️ Formula 1

- Lewis Hamilton
- Max Verstappen
- Charles Leclerc

---

## 🛠️ Technologies Used

### Machine Learning

- Scikit-learn
- Logistic Regression / SVM
- GridSearchCV

### Image Processing

- OpenCV
- Haar Cascade Classifier
- PyWavelets

### Backend

- Flask
- Gunicorn

### Frontend

- HTML
- CSS
- JavaScript

### Deployment

- Render

---

## 🧠 Machine Learning Workflow

1. Collect player images
2. Perform face detection using OpenCV
3. Crop the face region
4. Apply Wavelet Transform
5. Combine original and transformed features
6. Train multiple ML models
7. Perform hyperparameter tuning using GridSearchCV
8. Save the best model
9. Build Flask API
10. Deploy to Render

---

## 📂 Project Structure

```text
Sport-player-classification/
│
├── artifacts/
│   ├── celebrity_classification_model.pkl
│   └── names_scale.json
│
├── model/
│   ├── celebrity_classification.ipynb
│   ├── data_cleaning.ipynb
│   └── celebrity_file_names_dict.json
│
├── static/
│   ├── images/
│   ├── script.js
│   └── style.css
│
├── templates/
│   └── index.html
│
├── app.py
├── util.py
├── wavelet.py
├── requirements.txt
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Madhubalakumar07/Sport-player-classification.git

cd Sport-player-classification
```

---

### 2. Create a virtual environment

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Mac/Linux

```bash
python3 -m venv venv

source venv/bin/activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## ▶️ Run Locally

```bash
python app.py
```

Open your browser:

```text
http://127.0.0.1:5000
```

---

## 🌐 Render Deployment

### Build Command

```text
pip install -r requirements.txt
```

### Start Command

```text
gunicorn app:app
```

### Python Version

Create a file named:

```text
.python-version
```

Add:

```text
3.11.9
```

---

## 📊 Model Training

The following algorithms were experimented with:

- Logistic Regression
- Support Vector Machine (SVM)
- Random Forest

Hyperparameter tuning was performed using GridSearchCV to select the best performing model.

Example:

```python
GridSearchCV(
    pipeline,
    params,
    cv=5
)
```

---

## 🖼️ Feature Extraction

Each image undergoes two transformations:

### Original Image

32 × 32 resized image

### Wavelet Image

32 × 32 wavelet transformed image

Both are combined into a single feature vector before feeding into the model.

---

## 📈 Future Improvements

- Add more sports categories
- Improve UI/UX
- Support multiple faces
- Add deep learning models
- Deploy using Docker
- Add drag-and-drop upload

---

## 👨‍💻 Author

### Madhubalakumar S

LinkedIn:

Add your LinkedIn URL here

LeetCode:

https://leetcode.com/u/Madhubalakumar/

GitHub:

https://github.com/Madhubalakumar07

---

## ⭐ If you found this project useful

Please consider giving it a star ⭐ on GitHub.

It helps others discover the project and motivates future improvements.