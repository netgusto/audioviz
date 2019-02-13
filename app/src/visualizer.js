function Visualizer() {
    var audioSource;
    this.init = function(options) {
        audioSource = options.audioSource;
        var container = document.getElementById(options.containerId);
    };
};