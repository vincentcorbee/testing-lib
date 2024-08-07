export function consoleLogInterceptor(this: Console, originalConsoleLog: Console['log'], ...args: any[]) {
  originalConsoleLog.call(this, ...args);
}
