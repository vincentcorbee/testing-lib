export function consoleLogInterceptor(originalConsoleLog, ...args) {
    originalConsoleLog.call(this, ...args);
}
//# sourceMappingURL=console.log.interceptor.js.map