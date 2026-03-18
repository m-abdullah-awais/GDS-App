import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmModal, { type ConfirmVariant } from './ConfirmModal';

type DialogMode = 'confirm' | 'notify';

interface DialogRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: string;
  mode: DialogMode;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: string;
}

interface NotifyOptions {
  title: string;
  message: string;
  buttonLabel?: string;
  variant?: ConfirmVariant;
  icon?: string;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: (options: NotifyOptions) => Promise<void>;
}

const ConfirmationContext = createContext<ConfirmationContextType>({
  confirm: async () => false,
  notify: async () => { },
});

export const useConfirmation = () => useContext(ConfirmationContext);

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [resolver, setResolver] = useState<((result: boolean) => void) | null>(null);

  const closeWith = useCallback((result: boolean) => {
    if (resolver) {
      resolver(result);
    }
    setResolver(null);
    setRequest(null);
  }, [resolver]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setRequest({
        ...options,
        mode: 'confirm',
      });
      setResolver(() => resolve);
    });
  }, []);

  const notify = useCallback((options: NotifyOptions) => {
    return new Promise<void>((resolve) => {
      setRequest({
        title: options.title,
        message: options.message,
        confirmLabel: options.buttonLabel ?? 'OK',
        variant: options.variant ?? 'info',
        icon: options.icon,
        mode: 'notify',
      });
      setResolver(() => () => resolve());
    });
  }, []);

  const value = useMemo(
    () => ({ confirm, notify }),
    [confirm, notify],
  );

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
      <ConfirmModal
        visible={!!request}
        title={request?.title ?? ''}
        message={request?.message ?? ''}
        confirmLabel={request?.confirmLabel ?? 'Confirm'}
        cancelLabel={request?.cancelLabel ?? 'Cancel'}
        variant={request?.variant ?? 'primary'}
        icon={request?.icon}
        showCancel={request?.mode !== 'notify'}
        onConfirm={() => closeWith(true)}
        onCancel={() => closeWith(false)}
      />
    </ConfirmationContext.Provider>
  );
};