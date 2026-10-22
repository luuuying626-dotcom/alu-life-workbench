export async function registerServiceWorker(browser = navigator) {
  if (!browser.serviceWorker) return;
  await browser.serviceWorker.register('./sw.js');
}

registerServiceWorker().catch(() => {});
