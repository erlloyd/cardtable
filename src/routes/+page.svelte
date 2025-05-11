<script lang="ts">
    import { Stage, Layer, Rect } from 'svelte-konva';

    // Define the rectangle configuration
    let rectConfig = { x: 50, y: 50, width: 100, height: 100, fill: 'blue', draggable: true };

    // Track if we're currently dragging
    let isDragging = false;
</script>

<h1>Card Table</h1>

<Stage config={{ width: 1000, height: 1000 }}>
    <Layer>
        <Rect
            config={rectConfig}
            on:dragend={() => {
                console.log("Rectangle configuration:", rectConfig);
            }}
        />
    </Layer>
</Stage>