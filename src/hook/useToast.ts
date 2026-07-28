import { useCallback, useState } from 'react';

const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Stable identity: it only ever calls setToast, which React guarantees is
  // stable. Callers can therefore list showToast in an effect's dependency
  // array honestly, instead of omitting it to avoid an infinite re-run.
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return { toast, showToast };
};

export default useToast;
