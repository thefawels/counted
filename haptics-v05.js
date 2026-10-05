const preferenceKey = 'counted:haptics:v1';
export function hapticsEnabled() {
  try { return localStorage.getItem(preferenceKey) !== 'off'; } catch { return true; }
}
export function setHapticsEnabled(enabled) {
  try { localStorage.setItem(preferenceKey, enabled ? 'on' : 'off'); } catch {}
  if (enabled) pulse();
}
export function pulse() {
  if (!hapticsEnabled()) return;
  try { if (typeof navigator.vibrate === 'function') navigator.vibrate(10); } catch {}
}
export function nativeSwitchAvailable() {
  return typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    typeof HTMLInputElement !== 'undefined' && 'switch' in HTMLInputElement.prototype;
}
// Only use native touch targets in the keypad: WebKit switches can capture scrolling.
// The visible button remains the keyboard / screen reader target. No nested controls.
export function renderHapticButton(jsx, props, enabled, key) {
  if (!enabled || props.disabled || !nativeSwitchAvailable()) return jsx.jsx('button', props, key);
  return jsx.jsxs('div', {
    className: `haptic-key ${props.className || ''}`,
    children: [
      jsx.jsx('button', { ...props, className: `haptic-key-face ${props.className || ''}` }),
      jsx.jsx('input', {
        type: 'checkbox', switch: '', className: 'haptic-touch-target',
        tabIndex: -1, 'aria-hidden': 'true',
        onClick: event => event.stopPropagation(),
        onChange: event => { event.stopPropagation(); props.onClick?.(event); },
      }),
    ],
  }, key);
}
if (typeof document !== 'undefined') document.addEventListener('click', event => {
  if (!event.isTrusted || !(event.target instanceof Element)) return;
  const control = event.target.closest('button, input[type="checkbox"]');
  if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true' || control.hasAttribute('data-haptics-toggle')) return;
  pulse();
}, true);
