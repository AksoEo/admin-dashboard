import { stdlib } from '@tejo/akso-script';

/// - value: amount in smallest currecy unit
/// - currency: currency id
function CurrencyAmount ({ value, currency }) {
    return stdlib.currency_fmt.apply(null, [currency || '?', value | 0]);
}

export default {
    renderer: CurrencyAmount,
    inlineRenderer: CurrencyAmount,
};
