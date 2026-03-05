
// ---------------------------------------------
// file: /utils/haptics.js (optional safe fallback)
// ---------------------------------------------

// Try to use 'react-native-haptic-feedback' if installed; otherwise no-op.
let hapticsImpl = {
  impact: function () {},
  success: function () {},
  error: function () {},
};

try {
  // eslint-disable-next-line global-require
  const RNHB = require('react-native-haptic-feedback');
  const trigger = (type) => RNHB.default?.trigger(type, {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  });
  hapticsImpl = {
    impact: () => trigger('impactMedium'),
    success: () => trigger('notificationSuccess'),
    error: () => trigger('notificationError'),
  };
} catch (e) {}

export default hapticsImpl;