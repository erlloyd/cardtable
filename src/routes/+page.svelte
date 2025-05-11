<script lang="ts">
    import { Stage, Layer, Rect } from 'svelte-konva';
    import Konva from 'konva';

    // Define the rectangle configuration
    let rectConfig = { 
        x: window.innerWidth / 2, // Center horizontally
        y: window.innerHeight / 2, // Center vertically
        width: 100, 
        height: 200, // Increased height
        fill: 'blue', 
        draggable: true, 
        rotation: 0, 
        offsetX: 50, // Half of the width
        offsetY: 100 // Half of the new height
    };

    let isRotated = false; // Track rotation state

    // Animate the rotation using Konva.Animation
    const animateRotation = () => {
        let startRotation = rectConfig.rotation;
        let targetRotation = isRotated ? 0 : 90; // Toggle between 0 and 90 degrees
        isRotated = !isRotated;

        const animation = new Konva.Animation((frame) => {
            if (!frame) return;

            const progress = Math.min(frame.time / 200, 1); // 200ms duration for faster animation
            rectConfig.rotation = startRotation + (targetRotation - startRotation) * progress;

            if (progress >= 1) {
                rectConfig.rotation = targetRotation; // Ensure final value
                animation.stop();
            }
        });

        animation.start();
    };
</script>

<h1>Card Table</h1>

<Stage config={{ width: window.innerWidth, height: window.innerHeight }}>
    <Layer>
        <Rect
            config={rectConfig}
            on:dragend={() => {
                console.log("Rectangle configuration:", rectConfig);
            }}
            on:dblclick={() => {
                animateRotation();
                console.log("Rectangle rotated to:", rectConfig.rotation, "degrees");
            }}
        />
    </Layer>
</Stage>