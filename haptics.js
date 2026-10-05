// Keep feedback synchronous with the user's gesture. Unsupported devices are a no-op.
const preferenceKey = 'counted:haptics:v1';
export function hapticsEnabled() {
  try { return localStorage.getItem(preferenceKey) !== 'off'; } catch { return true; }
}
export function setHapticsEnabled(enabled) {
  try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch {}
  if (enabled) pulse();
}

let switchInput;
export function pulse() {
  if (!hapticsEnabled()) return;
  try {
    if (typeof navigator.vibrate === 'function' && navigator.vibrate(10)) return;
    // Safari on iPhone exposes haptics through native switch activation.
    // This fallback is best effort; physical feedback requires device testing.
    if (!('switch' in HTMLInputElement.prototype)) return;
    if (!switchInput) {
      switchInput = document.createElement('input');
      switchInput.type = 'checkbox';
      switchInput.setAttribute('switch', '');
      switchInput.setAttribute('aria-hidden', 'true');
      switchInput.tabIndex = -1;
      switchInput.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
      document.body.append(switchInput);
    }
    switchInput.click();
  } catch { /* Feedback must never block counting. */ }
}

document.addEventListener('click', event => {
  if (!event.isTrusted || !(event.target instanceof Element)) return;
  const control = event.target.closest('button, input[type="checkbox"]');
  if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true' || control.hasAttribute('data-haptics-toggle')) return;
  pulse();
}, true);
