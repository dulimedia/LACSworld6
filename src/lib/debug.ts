export const Q = new URLSearchParams(location.search);
export const DEBUG = Q.has('debug');
export const SAFE = Q.has('safe');

function push(msg: string) { 
  if (!DEBUG) return; 
  console.log(msg); 
}

export const log = {
  info: (m: string, ...a: any[]) => { 
    push(`[info] ${m}`); 
    a.length && console.log(...a); 
  },
  warn: (m: string, ...a: any[]) => { 
    push(`[warn] ${m}`); 
    a.length && console.warn(...a); 
  },
  err: (m: string, ...a: any[]) => { 
    push(`[err]  ${m}`); 
    a.length && console.error(...a); 
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('error', e => console.error('[window.error]', e.error || e));
  window.addEventListener('unhandledrejection', e => console.error('[unhandled]', e.reason));
  
  log.info('Device report', {
    ua: navigator.userAgent,
    mem: (navigator as any).deviceMemory,
    cores: navigator.hardwareConcurrency,
    width: innerWidth, 
    height: innerHeight,
    SAFE,
    DEBUG,
  });
}
