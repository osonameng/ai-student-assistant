export const log = {
    info: (...args: any[]) => console.log("ℹ️ [INFO]", ...args),
    warn: (...args: any[]) => console.warn("⚠️ [WARN]", ...args),
    error: (...args: any[]) => console.error("❌ [ERROR]", ...args),
    event: (event: string, payload?: any) =>
      console.log(`🧩 [EVENT] ${event}`, payload ? JSON.stringify(payload) : ""),
  };