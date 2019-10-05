//! Data store paths for login stuff. This is here because these are used in multiple places.

export const LOGIN = 'login';
export const LOGGED_IN = [LOGIN, 'logged-in'];
export const IS_ADMIN = [LOGIN, 'is-admin'];
export const TOTP_REQUIRED = [LOGIN, 'totp-required'];
export const TOTP_SETUP_REQUIRED = [LOGIN, 'totp-setup-required'];
