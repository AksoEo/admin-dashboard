import React from 'react';
import { Spring, lerp } from '../../../animation';

export default class MemberDetail extends React.PureComponent {
    titleNode = null;

    transitionWith (transitionNode) {
        if (!this.titleNode) return;

        const titleNode = this.titleNode;

        const startRect = transitionNode.getBoundingClientRect();
        const endRect = titleNode.getBoundingClientRect();

        transitionNode.style.transformOrigin = '0 0';
        titleNode.style.transformOrigin = '0 0';
        titleNode.style.opacity = 0;

        const spring = new Spring(1.3, 0.4);
        spring.on('update', p => {
            const xp = Math.pow(p, 0.8);
            const yp = Math.pow(p, 2);

            const tx = lerp(startRect.left, endRect.left, xp);
            const ty = lerp(startRect.top, endRect.top, yp);
            const tsx = lerp(1, endRect.width / startRect.width, p);
            const tsy = lerp(1, endRect.height / startRect.height, p);

            transitionNode.style.transform = `translate(${tx}px, ${ty}px) scale(${tsx}, ${tsy})`;
            transitionNode.style.opacity = 1 - p;

            const ux = lerp(startRect.left - endRect.left, 0, xp);
            const uy = lerp(startRect.top - endRect.top, 0, yp);
            const usx = lerp(startRect.width / endRect.width, 1, p);
            const usy = lerp(startRect.height / endRect.height, 1, p);

            titleNode.style.transform = `translate(${ux}px, ${uy}px) scale(${usx}, ${usy})`;
            titleNode.style.opacity = p;

            if (p === 1 && transitionNode.parentNode) {
                document.body.removeChild(transitionNode);
            }
        });
        spring.target = 1;
        spring.start();
    }

    render () {
        return (
            <div className="app-subpage member-detail-page">
                <h1>
                    detail page for <span
                        style={{ display: 'inline-block' }}
                        ref={node => this.titleNode = node}>
                        Example McExampleface
                    </span> goes here
                </h1>
            </div>
        );
    }
}
