import { h } from 'preact';
import { forwardRef, useState, useEffect } from 'preact/compat';
import { CodeMirror } from './codemirror';
import { xcodeLight, xcodeDark } from '@uiw/codemirror-theme-xcode';

const themeQuery = window.matchMedia('(prefers-color-scheme: light)');

export default forwardRef(({ value, onChange, forceDark, ...extra }, ref) => {
    const [useLightTheme, setUseLightTheme] = useState(themeQuery.matches);

    useEffect(() => {
        const onThemeChange = () => {
            setUseLightTheme(themeQuery.matches);
        };
        themeQuery.addEventListener('change', onThemeChange);
        return () => {
            themeQuery.removeEventListener('change', onThemeChange);
        };
    });

    const theme = (!forceDark && useLightTheme) ? xcodeLight : xcodeDark;

    return (
        <CodeMirror
            ref={ref}
            value={value}
            onChange={newValue => {
                if (newValue === value) return;
                onChange(newValue);
            }}
            theme={theme}
            {...extra} />
    );
});
