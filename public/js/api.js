const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
window.Telegram?.WebApp?.ready(); window.Telegram?.WebApp?.expand();
export const socket = io({ auth: { user: telegramUser } });
