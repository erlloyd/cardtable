
<script lang="ts">
    import { Rect } from 'svelte-konva';
    import Konva from 'konva';
    import type { RectConfig } from 'konva/lib/shapes/Rect';

    export let rectConfig: RectConfig;
    let isRotated = false; // Track rotation state

    const animateRotation = () => {
        let startRotation = rectConfig.rotation ?? 0; // Default to 0 if rotation is undefined
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