<script lang="ts">
    import { Stage, Layer } from 'svelte-konva';
    import CardStack from '../components/CardStack.svelte';

    // Track window dimensions
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // Function to generate a rectangle configuration
    function generateRectConfig(index: number) {
        const width = Math.random() * 150 + 50; // Random width between 50 and 200
        const height = Math.random() * 150 + 50; // Random height between 50 and 200
        return {
            x: Math.random() * windowWidth, // Random x position
            y: Math.random() * windowHeight, // Random y position
            width,
            height,
            fill: `hsl(${Math.random() * 360}, 100%, 50%)`, // Random color
            draggable: true,
            rotation: 0,
            offsetX: width / 2,
            offsetY: height / 2
        };
    }

    // Generate 100 rectangle configurations
    let rectConfigs = Array.from({ length: 100 }, (_, index) => generateRectConfig(index));
</script>

<Stage config={{ width: windowWidth, height: windowHeight }}>
    <Layer>
        {#each rectConfigs as rectConfig}
            <CardStack rectConfig={rectConfig} />
        {/each}
    </Layer>
</Stage>