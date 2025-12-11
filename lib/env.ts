"use client"

export function isBrowser() {
  return typeof window !== "undefined"
}

export function isLocalhost() {
  if (!isBrowser()) return false
  const host = window.location.hostname
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]"
}

export function isDevEnvironment() {
  return process.env.NODE_ENV === "development"
}

export function isLocalDevRuntime() {
  return isDevEnvironment() && (typeof window === "undefined" || isLocalhost())
}
