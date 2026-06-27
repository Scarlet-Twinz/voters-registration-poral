/* ============================================
   BIOMETRIC.JS - Camera & Fingerprint Capture
   ============================================ */

let videoStream = null;
let videoElement = null;
let canvasElement = null;

// ----- START CAMERA -----
async function startCamera(videoElementId) {
    videoElement = document.getElementById(videoElementId);

    if (!videoElement) {
        showError('Video element not found!');
        return false;
    }

    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        videoElement.srcObject = videoStream;
        await videoElement.play();

        return true;
    } catch (error) {
        console.error('Camera error:', error);
        showError('Camera access denied! Please allow camera permissions.');
        return false;
    }
}

// ----- STOP CAMERA -----
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    if (videoElement) {
        videoElement.srcObject = null;
    }
}

// ----- CAPTURE PHOTO -----
function capturePhoto(canvasElementId) {
    canvasElement = document.getElementById(canvasElementId);

    if (!videoElement || !videoElement.videoWidth) {
        showError('Camera not started!');
        return null;
    }

    const canvas = canvasElement || document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg');
}

// ----- CAPTURE PHOTO TO IMG ELEMENT -----
function capturePhotoToImage(imageElementId) {
    const img = document.getElementById(imageElementId);
    if (!img) {
        showError('Image element not found!');
        return null;
    }

    const photoData = capturePhoto();
    if (photoData) {
        img.src = photoData;
        img.style.display = 'block';
        return photoData;
    }

    return null;
}

// ----- SIMULATE FINGERPRINT -----
function simulateFingerprint() {
    // Generate a random fingerprint pattern (simulated)
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;

    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 200);

    // Simulate fingerprint ridges
    for (let i = 0; i < 20; i++) {
        const x = 20 + i * 8 + Math.random() * 5;
        const y = 10 + i * 9;
        const width = 160 - Math.random() * 20;
        const height = 5 + Math.random() * 3;

        ctx.beginPath();
        ctx.ellipse(100 + (i - 10) * 3, 100 + (i - 10) * 2, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Add some random dots
        if (i % 3 === 0) {
            ctx.beginPath();
            ctx.arc(60 + i * 4, 50 + i * 5, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#666';
            ctx.fill();
        }
    }

    // Add swirl pattern
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 10, 100, 20 + i * 15, 0, Math.PI * 2);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    return canvas.toDataURL('image/png');
}

// ----- SAVE BIOMETRIC DATA -----
function saveBiometric(voterId, photoData, fingerprintData) {
    const biometrics = {
        voterId: voterId,
        photo: photoData || null,
        fingerprint: fingerprintData || null,
        capturedAt: getCurrentDateTime()
    };

    localStorage.setItem('biometric_' + voterId, JSON.stringify(biometrics));
    addAuditLog('BIOMETRIC_CAPTURE', `Biometric data saved for ${voterId}`);

    return biometrics;
}

// ----- GET BIOMETRIC DATA -----
function getBiometric(voterId) {
    const data = localStorage.getItem('biometric_' + voterId);
    if (!data) return null;
    return JSON.parse(data);
}

// ----- VERIFY BIOMETRIC -----
function verifyBiometric(voterId, capturedFingerprint) {
    const stored = getBiometric(voterId);
    if (!stored) {
        return { success: false, message: 'No biometric data found!' };
    }

    // Simple comparison (in production, use proper biometric matching)
    if (stored.fingerprint === capturedFingerprint) {
        return { success: true, message: 'Biometric verified!' };
    }

    return { success: false, message: 'Biometric does not match!' };
}

// ----- CHECK CAMERA SUPPORT -----
function isCameraSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// ----- GET CAMERA STATUS -----
function getCameraStatus() {
    if (!isCameraSupported()) {
        return { available: false, message: 'Camera not supported on this device' };
    }

    return { available: true, message: 'Camera available' };
}