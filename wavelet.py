import numpy as np
import cv2
import pywt

def w2d(image, wavelet='haar', level=1):
    img_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    img_gray = np.float32(img_gray) / 255.0

    coeffs_h = pywt.wavedec2(img_gray, wavelet, level=level)
    
    coeffs = list(coeffs_h)
    coeffs[0] *= 0

    img_reconstructed = pywt.waverec2(coeffs, wavelet)

    img_reconstructed = np.clip(img_reconstructed, 0, 1)

    return (img_reconstructed * 255).astype(np.uint8)


def wavelet_transform(image, wavelet='haar', level=1):
    return w2d(image, wavelet=wavelet, level=level)