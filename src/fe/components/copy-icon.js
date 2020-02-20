import { h } from 'preact';

/* eslint-disable react/no-unknown-property */

export default function CopyIcon (props) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
            <path d="M15.5,2.5 L15.5,4.5 L5.5,4.5 L5.5,16.5 L3.5,16.5 L3.5,4.5 C3.5,3.3954305 4.3954305,2.5 5.5,2.5 L15.5,2.5 L15.5,2.5 Z" fill="currentColor" fill-rule="nonzero" />
            <path d="M8,7 L19,7 L19,21 L8,21 L8,7 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </svg>
    );
}
