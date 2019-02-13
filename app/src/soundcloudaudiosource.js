function SoundCloudAudioSource(player) {
    var self = this;
    var analyser;
    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    var sampleAudioStream = function() {
        analyser.getByteFrequencyData(self.streamData);
        // Calculate an overall volume value
        var total = 0;
        for (var i = 0; i < 64; i++) {
            // Get the volume from the first 64 bins
            total += self.streamData[i];
        }
        self.volume = total;

        var totalLow = 0;
        for (var i = 0; i < 31; i++) {
            // Get the volume from the first 32 bins
            totalLow += self.streamData[i];
        }
        self.volumeLow = totalLow;

        var totalHi = 0;
        for (var i = 31; i < 64; i++) {
            // Get the volume from the second 32 bins
            totalHi += self.streamData[i];
        }
        self.volumeHi = totalHi;
    };

    const sampleRaf = () => {
        sampleAudioStream();
        window.requestAnimationFrame(sampleRaf);
    };

    window.requestAnimationFrame(sampleRaf);
    // setInterval(sampleAudioStream, 20);

    // Public properties and methods
    this.volume = 0;
    this.volumeLow = 0;
    this.volumeHi = 0;
    this.streamData = new Uint8Array(256);
    this.playStream = function(streamUrl) {
        // Get the input stream from the audio element
        player.addEventListener("ended", function() {
            self.directStream("coasting");
        });
        player.crossOrigin = "anonymous";
        player.setAttribute("src", streamUrl);
        player.play();
    };
};