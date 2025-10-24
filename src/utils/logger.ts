const LOG_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true';

const LOG_CATEGORIES = {
  CAMERA: false,
  GLB: false,
  FLOORPLAN: false,
  REQUEST: true,
  ERROR: true,
  PERFORMANCE: false,
  LOADING: false,
  UI: false,
};

type LogCategory = keyof typeof LOG_CATEGORIES;

class Logger {
  private enabled: boolean;
  private categories: Record<LogCategory, boolean>;

  constructor() {
    this.enabled = LOG_ENABLED;
    this.categories = { ...LOG_CATEGORIES };
  }

  enableCategory(category: LogCategory) {
    this.categories[category] = true;
  }

  disableCategory(category: LogCategory) {
    this.categories[category] = false;
  }

  log(category: LogCategory, emoji: string, ...args: any[]) {
    if (!this.enabled || !this.categories[category]) return;
    console.log(`${emoji}`, ...args);
  }

  warn(category: LogCategory, emoji: string, ...args: any[]) {
    if (!this.enabled || !this.categories[category]) return;
    console.warn(`${emoji}`, ...args);
  }

  error(...args: any[]) {
    if (!this.categories.ERROR) return;
    console.error('❌', ...args);
  }

  group(category: LogCategory, emoji: string, label: string) {
    if (!this.enabled || !this.categories[category]) return;
    console.group(`${emoji} ${label}`);
  }

  groupEnd() {
    if (!this.enabled) return;
    console.groupEnd();
  }
}

export const logger = new Logger();
