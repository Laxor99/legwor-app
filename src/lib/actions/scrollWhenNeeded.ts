/** Enable vertical scroll only when content actually overflows the container. */
export function scrollWhenNeeded(node: HTMLElement) {
	const observed = new WeakSet<Element>();

	const observeChildren = () => {
		for (const child of node.children) {
			if (observed.has(child)) continue;
			observed.add(child);
			resizeObserver.observe(child);
		}
	};

	const update = () => {
		const overflows = node.scrollHeight > node.clientHeight + 1;
		node.style.overflowY = overflows ? 'auto' : 'hidden';
	};

	const resizeObserver = new ResizeObserver(() => {
		observeChildren();
		update();
	});
	resizeObserver.observe(node);
	observeChildren();

	const mutationObserver = new MutationObserver(() => {
		observeChildren();
		update();
	});
	mutationObserver.observe(node, { childList: true, subtree: true, attributes: true });

	update();

	return {
		destroy() {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		}
	};
}
