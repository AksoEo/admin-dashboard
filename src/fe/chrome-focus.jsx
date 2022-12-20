//! For some reason, Chrome focuses elements when you tap on them and causes their focus
//! styles to activate for no good reason, so here’s a few blacklisted elements for which
//! we can be sure that it makes no sense.

if (navigator.userAgent.includes('Chrome/')) {
    const isBlacklisted = element => {
        if (element instanceof HTMLInputElement) {
            const blacklistedTypes = [
                'checkbox',
                'radio',
                'submit',
                'button',
            ];
            if (blacklistedTypes.includes(element.type)) return true;
        } else if (element instanceof HTMLButtonElement) return true;
        else if (element instanceof HTMLAnchorElement) return true;
        return false;
    };

    const maybeBlurActive = () => {
        const node = document.activeElement;
        if (isBlacklisted(node) && document.activeElement === node) {
            node.blur();
        }
    };

    window.addEventListener('mousedown', () => setImmediate(maybeBlurActive));
    window.addEventListener('mouseup', maybeBlurActive);
    window.addEventListener('touchend', e => {
        if (e.touches.length === 0) maybeBlurActive();
    });
}
