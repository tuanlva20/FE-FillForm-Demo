// Utility đơn giản để bật/tắt console logs
const ENABLE_CONSOLE_LOGS = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (ENABLE_CONSOLE_LOGS) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (ENABLE_CONSOLE_LOGS) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (ENABLE_CONSOLE_LOGS) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (ENABLE_CONSOLE_LOGS) {
      console.info(...args);
    }
  },
  group: (...args: any[]) => {
    if (ENABLE_CONSOLE_LOGS) {
      console.group(...args);
    }
  },
  groupEnd: () => {
    if (ENABLE_CONSOLE_LOGS) {
      console.groupEnd();
    }
  }
};

// Override console methods nếu không enable
if (!ENABLE_CONSOLE_LOGS) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
}
