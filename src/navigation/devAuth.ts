export type DevRoleOverride = 'admin' | 'instructor' | 'student' | null;

type Listener = () => void;

let roleOverride: DevRoleOverride = null;
const listeners = new Set<Listener>();

export const getDevRoleOverride = () => roleOverride;

export const subscribeDevRoleOverride = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const setDevRoleOverride = (role: Exclude<DevRoleOverride, null>) => {
  if (!__DEV__) {
    return;
  }

  roleOverride = role;
  listeners.forEach(listener => listener());
};

export const clearDevRoleOverride = () => {
  if (!__DEV__) {
    return;
  }

  roleOverride = null;
  listeners.forEach(listener => listener());
};
