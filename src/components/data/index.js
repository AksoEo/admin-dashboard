import address from './address';
import country from './country';
import date from './date';
import email from './email';
import phoneNumber from './phone-number';
import ueaCode from './uea-code';

import './style';

/// Data types.
///
/// # Items
/// Each item in this object describes a data type as follows:
///
/// ### Item Properties
/// - `renderer`: a component that renders the item.
/// - `inlineRenderer`: a component (possibly the same as `renderer`) that renders the item as an
///   inline block and without any sort of interactivity.
/// - `editor`: Form (uppercase F!) field that provides an editor for this data type
///
/// Renderers must have a `value` prop, and editors must have both `value` and `onChange`.
///
/// Multi-field renderers may also accept `valuek` for k ∈ ℕ \ {0, 1}.
export default {
    address,
    country,
    date,
    email,
    phoneNumber,
    ueaCode,
};
