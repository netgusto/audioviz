function makeRenderContext(camera, time, cubes, centerCube, audioSource, renderer, scene, composer, plane) {
    return function render() {

        // I recycled the mental var, this should go from 0 to 1 and jumps in between with the music
        // It's not an ideal beat detector but it works!
        var mental = Math.min(
            Math.max(Math.tan(audioSource.volumeHi / 6500) * 0.5),
            2
        );

        camera.position.x =
            Math.cos(time.getElapsedTime() / 4) * 350 + cubes[centerCube].position.x; // X Cos wave around the center cube (I know, I should calculate the center of the group instead)
        // camera.position.z =
        //     Math.sin(time.getElapsedTime() / 4) * 350 + cubes[centerCube].position.z; // Z Sin wave around center cube, now my camera goes around. PS. 350 is the distance of the camera.

        camera.position.y = 200 + 120 * mental; // Make the camera bounce on rhythm

        for (var i = audioSource.streamData.length - 1; i >= 0; i--) {
            // My error here is: I am still doing a full cycle for the streamData array while I should pick only as many channel as my cube matrix
            // I have left this just in case I wanted to increase the data channels
            if (!!cubes[i]) {
                // Need to save javascript into crashing

                var currentAudioChannelVolume = audioSource.streamData[i]; // Makes more sense than streamData

                cubes[i].scale.y = (currentAudioChannelVolume + 0.1) / 3; // Makes cube taller with the volume
                cubes[i].position.y = (currentAudioChannelVolume + 0.1) / 3 / 2; // Since scale works in 2 ways (Y axis and -Y axis) I compensate by applying half position onto the Y axis

                // cubes[i].scale.x = 1 / 255 * (255 - currentAudioChannelVolume / 1.5); // Makes the cube thinner when louder and fatter when no volume is hitting the channel,
                // cubes[i].scale.z = 1 / 255 * (255 - currentAudioChannelVolume / 1.5); // 1.5 at the end should restrict the scale at roughly 70% otherwise high volumes becomes lines

                cubes[i].material.color.setHSL(
                    0.27 / 255 * (255 - currentAudioChannelVolume),
                    1,
                    0.6
                ); // HSL color wheel, 0.27 (100 degrees) is green from silence to 0 (red)
                cubes[i].material.ambient.setHSL(
                    0.27 / 255 * (255 - currentAudioChannelVolume),
                    1,
                    0.5
                );
                cubes[i].material.opacity = 1 / 255 * currentAudioChannelVolume;

            }
        }

        // plane.material.ambient.setHSL(0, 0, mental); // HSL

        // controls.update(); // Uncomment this if you want to enable controls
        // renderer.render(scene, camera); // Uncomment this if you want to switch off postprocessing

        camera.lookAt(cubes[centerCube].position); // Comment this if you want to enable controls, otherwise it crashes badly
    
        renderer.clear(); // Comment this if you want to switch off postprocessing
        composer.render(time.getElapsedTime()); // Comment this if you want to switch off postprocessing
        // renderer.render(scene, camera);
    
        requestAnimationFrame(render);
    };
}