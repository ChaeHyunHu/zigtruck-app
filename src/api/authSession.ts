type AuthSessionEvent = "token-updated" | "session-ended";

type AuthSessionListener = (event: AuthSessionEvent, token?: string) => void;

const listeners = new Set<AuthSessionListener>();

export function subscribeAuthSession(listener: AuthSessionListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyAuthTokenUpdated(token: string) {
  listeners.forEach((listener) => listener("token-updated", token));
}

export function notifyAuthSessionEnded() {
  listeners.forEach((listener) => listener("session-ended"));
}
