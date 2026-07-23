const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
const searchParams = new URLSearchParams(window.location.search);
const startParam =
  window.Telegram?.WebApp?.initDataUnsafe?.startParam ||
  window.Telegram?.WebApp?.initDataUnsafe?.start_param ||
  null;
const referrerId =
  searchParams.get("ref") ||
  searchParams.get("referrer") ||
  startParam ||
  null;
window.Telegram?.WebApp?.ready();
window.Telegram?.WebApp?.expand();
export const socket = io({ auth: { user: telegramUser, initData: window.Telegram?.WebApp?.initData || '', referrer: referrerId } });
