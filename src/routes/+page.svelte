<script lang="ts">
	import { onMount } from 'svelte';
	import { Stage, Layer, Rect } from 'svelte-konva';
	import Konva from 'konva';
	import * as Y from 'yjs';

	// Define the type for the rectangle state
	type RectState = {
		x: number;
		y: number;
		width: number;
		height: number;
		fill: string;
	};

	// Initialize Yjs document and shared state
	const ydoc = new Y.Doc();
	const ystate: Y.Map<RectState> = ydoc.getMap('state');

	// Example state synchronization
	ystate.set('rect', { x: 50, y: 50, width: 100, height: 100, fill: 'blue' });

	let rectState: RectState = ystate.get('rect') as RectState;

	// Listen for updates
	ystate.observe(() => {
		rectState = ystate.get('rect') as RectState;
	});
</script>

<h1>Card Table</h1>
<Stage config={{ width: 1000, height: 1000 }}>
	<Layer>
		<Rect
      config={{
        x: rectState.x,
        y: rectState.y,
        width: rectState.width,
        height: rectState.height,
        fill: rectState.fill,
        draggable: true
      }}
      on:dragend={(e) => {
        ystate.set('rect', {
          ...rectState,
		  x: e.target ? (e.target as any).x() : rectState.x,
		  y: e.target ? (e.target as any).y() : rectState.y
        });
      }}
    />
	</Layer>
</Stage>
