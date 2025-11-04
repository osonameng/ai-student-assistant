// src/polyfills.ts

// Global Map / Symbol fix for Safari / Turbopack
if (typeof Map === "undefined") {
    // @ts-ignore
    globalThis.Map = window.Map ?? (class {});
  }
  
  if (typeof Symbol === "undefined") {
    // @ts-ignore
    globalThis.Symbol = window.Symbol ?? (class {});
  }