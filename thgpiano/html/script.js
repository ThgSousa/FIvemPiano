document.addEventListener("DOMContentLoaded", function() {
    const pianoKeys = document.querySelectorAll(".piano-keys .key");
    const volumeSlider = document.querySelector(".volume-slider input");
    const keysCheckbox = document.querySelector(".keys-checkbox input");
    const pitchStatus = document.getElementById('pitchStatus');
    
    let allKeys = [];
    let currentVolume = 0.5;
    let keyStates = {};
    let isShiftPressed = false;
    let isCtrlPressed = false;

    function updatePitchStatus() {
        if (isShiftPressed) {
            pitchStatus.textContent = "Tom Alto";
            pitchStatus.className = "status high-pitch";
        } else if (isCtrlPressed) {
            pitchStatus.textContent = "Tom baixo";
            pitchStatus.className = "status low-pitch";
        } else {
            pitchStatus.textContent = "Tom Normal";
            pitchStatus.className = "status normal-pitch";
        }
    }

    function playTune(note, volume) {
        let prefix = "none";
        if (isShiftPressed) {
            prefix = "shift_";
        } else if (isCtrlPressed) {
            prefix = "ctrl_";
        }
        
        const soundPath = `nui://xsound/html/sounds/${prefix}${note}.ogg`;

        $.post('https://thgpiano/playPianoNote', JSON.stringify({
            note: note,
            volume: volume,
            soundPath: soundPath,
            modifier: prefix
        }));

        const clickedKey = document.querySelector(`[data-key="${note}"]`);
        clickedKey.classList.add("active");

        setTimeout(() => {
            clickedKey.classList.remove("active");
        }, 100);
    }

    pianoKeys.forEach(key => {
        allKeys.push(key.dataset.key);

        key.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (!keyStates[key.dataset.key]) {
                keyStates[key.dataset.key] = true;
                playTune(key.dataset.key, currentVolume);
            }
        });

        key.addEventListener("mouseup", (e) => {
            e.preventDefault();
            keyStates[key.dataset.key] = false;
        });

        key.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (!keyStates[key.dataset.key]) {
                keyStates[key.dataset.key] = true;
                playTune(key.dataset.key, currentVolume);
            }
        });

        key.addEventListener("touchend", (e) => {
            e.preventDefault();
            keyStates[key.dataset.key] = false;
        });
    });

    const handleKeyDown = (e) => {
        if (e.key === 'Shift') {
            isShiftPressed = true;
        } else if (e.key === 'Control') {
            isCtrlPressed = true;
        } else if (allKeys.includes(e.key.toUpperCase())) {
            e.preventDefault();
            if (!keyStates[e.key.toUpperCase()]) {
                keyStates[e.key.toUpperCase()] = true;
                playTune(e.key.toUpperCase(), currentVolume);
            }
        } else if (e.key === 'Escape') {
            // Send message to close the piano UI
            $.post('https://thgpiano/closePiano', JSON.stringify({}));
        }
        updatePitchStatus();
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Shift') {
            isShiftPressed = false;
        } else if (e.key === 'Control') {
            isCtrlPressed = false;
        } else if (allKeys.includes(e.key.toUpperCase())) {
            e.preventDefault();
            keyStates[e.key.toUpperCase()] = false;
        }
        updatePitchStatus();
    };

    const handleVolume = (e) => {
        currentVolume = e.target.value;
    };

    const showHideKeys = () => {
        pianoKeys.forEach(key => key.classList.toggle("hide"));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    volumeSlider.addEventListener("input", handleVolume);
    keysCheckbox.addEventListener("click", showHideKeys);

    window.addEventListener('message', function(event) {
        if (event.data.type === 'showPiano') {
            document.querySelector('.wrapper').style.display = 'block';
            document.getElementById('hint').style.display = 'block';
        } else if (event.data.type === 'hidePiano') {
            document.querySelector('.wrapper').style.display = 'none';
            document.getElementById('hint').style.display = 'none';
        }
    });
});
