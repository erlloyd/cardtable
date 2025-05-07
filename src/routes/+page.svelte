<script>
	import { onMount } from 'svelte';
	import { Stage, Layer, Rect } from 'svelte-konva';
	import * as Y from 'yjs';

	// Initialize Yjs document and shared state
	const ydoc = new Y.Doc();
	const ystate = ydoc.getMap('state');

	// Example state synchronization
	ystate.set('rect', { x: 50, y: 50, width: 100, height: 100, fill: 'blue' });

	let rectState = ystate.get('rect');

	// Listen for updates
	ystate.observe(() => {
		rectState = ystate.get('rect');
	});
</script>

<h1>Card Table</h1>
<Stage width={800} height={600}>
	<Layer>
		<Rect
			x={rectState.x}
			y={rectState.y}
			width={rectState.width}
			height={rectState.height}
			fill={rectState.fill}
			draggable
			on:dragend={(e) => {
				ystate.set('rect', {
					...rectState,
					x: e.target.x(),
					y: e.target.y()
				});
			}}
		/>
	</Layer>
</Stage>
