import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', icon: '#34d399', text: '#ecfdf5' },
  error:   { bg: 'rgba(239, 68, 68, 0.12)',  border: 'rgba(239, 68, 68, 0.3)',  icon: '#f87171', text: '#fef2f2' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', icon: '#fbbf24', text: '#fffbeb' },
  info:    { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)', icon: '#818cf8', text: '#eef2ff' },
};

export default function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px' }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          const c = colors[toast.type] || colors.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <Icon size={20} color={c.icon} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ flex: 1, color: c.text, fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
              <button onClick={() => remove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.icon, opacity: 0.7, padding: 0 }}>
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
