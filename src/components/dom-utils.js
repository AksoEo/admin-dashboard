/**
 * Clones a node and its children, including styles.
 * @param {Node} node - a DOM node
 * @returns {Node} - the node’s clone
 */
export function deepCloneNode (node) {
    const newNode = node.cloneNode(false);
    if (newNode.nodeType === 1) {
        Object.assign(newNode.style, getComputedStyle(node));
    }

    for (const child of node.childNodes) {
        newNode.appendChild(deepCloneNode(child));
    }

    return newNode;
}

/**
 * Clones a node (see [deepCloneNode]) and adds `position: fixed` and a transform such that
 * appending the result to `document.body` will make it seem like the node hasn’t moved at all.
 *
 * This will override the following style properties: `position`, `zIndex`, `top`, `left`, `width`,
 * `height`, `transform`.
 *
 * @param {Node} node - a DOM node to clone
 * @param {?number} zIndex - the new node’s z index
 * @returns {Object} an object with fields `node`, `left`, `top`, `width`, `height`
 */
export function cloneNodeInScreenSpace (node, zIndex = 100) {
    const { left, top, width, height } = node.getBoundingClientRect();
    const clone = deepCloneNode(node);
    Object.assign(clone.style, {
        position: 'fixed',
        zIndex,
        top: 0,
        left: 0,
        width: width + 'px',
        height: height + 'px',
        transform: `translate(${left}px, ${top}px)`,
    });
    return { node: clone, left, top, width, height };
}
