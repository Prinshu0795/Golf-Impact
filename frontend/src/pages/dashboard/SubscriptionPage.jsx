import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../../context/SubscriptionContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services';
import {
  CreditCard, Check, Calendar, XCircle, Zap, Shield,
  Trophy, RefreshCw, AlertTriangle, IndianRupee, Clock,
  CheckCircle, X, ChevronRight,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

// ─── Plan Configuration ───────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹799',
    priceNum: 799,
    period: 'month',
    color: '#818cf8',
    features: [
      'All monthly draw entries',
      'Full score tracking (up to 5)',
      'Charity selection & donation',
      'Winner verification support',
      'Priority email support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹7,999',
    priceNum: 7999,
    period: 'year',
    color: '#a78bfa',
    popular: true,
    savings: 'Save ₹1,589',
    features: [
      'Everything in Monthly',
      'Priority support & early access',
      '~17% savings vs monthly',
      'Annual draw bonus entry',
      'Exclusive member badge',
    ],
  },
];

// ─── Load Razorpay Script ─────────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status, cancelAtPeriodEnd }) {
  const label = cancelAtPeriodEnd ? 'Cancels at period end' : status;
  const colorMap = {
    active: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    cancelled: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
    expired: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    past_due: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  };
  const c = colorMap[cancelAtPeriodEnd ? 'cancelled' : status] || colorMap.expired;
  return (
    <span style={{
      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.72rem',
      fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {label}
    </span>
  );
}

function PlanCard({ plan, onSelect, loading, isCurrentPlan }) {
  const [hovered, setHovered] = useState(false);
  const { id, name, price, period, color, popular, savings, features } = plan;

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'relative',
        padding: '2rem',
        borderRadius: '20px',
        border: popular
          ? `1px solid ${hovered ? 'rgba(167,139,250,0.6)' : 'rgba(167,139,250,0.3)'}`
          : `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        background: popular
          ? `linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)`
          : 'var(--bg-card)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        boxShadow: hovered
          ? popular
            ? '0 20px 60px rgba(139,92,246,0.2)'
            : '0 16px 40px rgba(0,0,0,0.3)'
          : 'none',
      }}
    >
      {popular && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          padding: '0.3rem 1.25rem', borderRadius: '9999px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          fontSize: '0.72rem', fontWeight: 800, color: 'white',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        }}>
          ⭐ Best Value
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: `${color}18`, border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {popular ? <Zap size={18} color={color} /> : <CreditCard size={18} color={color} />}
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.15rem' }}>{name}</h3>
        </div>
        {savings && (
          <span style={{
            padding: '0.15rem 0.6rem', borderRadius: '6px',
            background: 'rgba(52,211,153,0.1)', color: '#34d399',
            fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(52,211,153,0.2)',
          }}>
            {savings}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color, fontFamily: 'Outfit' }}>
            {price}
          </span>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>/{period}</span>
        </div>
      </div>

      <ul style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: '0.625rem', fontSize: '0.875rem', color: '#94a3b8', alignItems: 'flex-start' }}>
            <Check size={15} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} /> {f}
          </li>
        ))}
      </ul>

      <button
        id={`subscribe-${id}`}
        onClick={() => onSelect(id)}
        disabled={loading || isCurrentPlan}
        style={{
          width: '100%', padding: '0.875rem', borderRadius: '12px',
          fontWeight: 700, fontSize: '0.9rem', cursor: loading || isCurrentPlan ? 'not-allowed' : 'pointer',
          background: isCurrentPlan
            ? 'rgba(52,211,153,0.1)'
            : popular
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'rgba(255,255,255,0.06)',
          color: isCurrentPlan ? '#34d399' : 'white',
          border: isCurrentPlan ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          transition: 'all 0.2s',
          boxShadow: !isCurrentPlan && popular ? '0 8px 24px rgba(99,102,241,0.35)' : 'none',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <><Spinner size={16} color="white" /> Processing…</>
        ) : isCurrentPlan ? (
          <><CheckCircle size={16} /> Current Plan</>
        ) : (
          <>Subscribe {name} <ChevronRight size={16} /></>
        )}
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const { subscription, isActive, refetch } = useSubscription();
  const { success, error: toastError, info } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Load payment history
  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await subscriptionService.getPayments();
      setPayments(res.payments || []);
    } catch { setPayments([]); }
    finally { setPaymentsLoading(false); }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  // ── Razorpay Checkout Handler ───────────────────────────────────────────────
  const handleSubscribe = useCallback(async (planId) => {
    setLoading(true);
    setActivePlanId(planId);

    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toastError('Failed to load Razorpay SDK. Check your internet connection.');
        return;
      }

      // 2. Create order on backend
      const orderRes = await subscriptionService.createOrder(planId);
      if (!orderRes.success) throw new Error(orderRes.message || 'Failed to create order');

      const { orderId, amount, currency, keyId } = orderRes;
      const plan = PLANS.find((p) => p.id === planId);

      // 3. Open Razorpay Checkout popup
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount,
          currency,
          order_id:    orderId,
          name:        'Golf Impact',
          description: `${plan?.name} Subscription`,
          image:       '/logo.svg',
          prefill: {
            name:  user?.full_name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#6366f1' },
          modal: {
            ondismiss: () => {
              info('Payment cancelled. No charge was made.');
              reject(new Error('dismissed'));
            },
          },
          handler: async (response) => {
            try {
              // 4. Verify signature on backend
              const verifyRes = await subscriptionService.verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan:                planId,
              });

              if (!verifyRes.success) throw new Error(verifyRes.message);

              success('🎉 Subscription activated! Welcome to Golf Impact Premium!');
              await refetch();
              await loadPayments();
              resolve();
            } catch (err) {
              toastError(err.message || 'Payment verification failed. Contact support.');
              reject(err);
            }
          },
        });
        rzp.open();
      });
    } catch (err) {
      if (err.message !== 'dismissed') {
        toastError(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setActivePlanId(null);
    }
  }, [user, refetch, loadPayments, success, toastError, info]);

  // ── Cancel Handler ─────────────────────────────────────────────────────────
  const handleCancel = async () => {
    setShowCancelModal(false);
    setLoading(true);
    try {
      const res = await subscriptionService.cancel();
      success(res.message || 'Subscription cancelled successfully.');
      await refetch();
    } catch (e) { toastError(e.message); }
    finally { setLoading(false); }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const expiryDate = subscription?.expires_at || subscription?.current_period_end;
  const currentPlanId = isActive ? subscription?.plan : null;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
          Subscription
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Manage your Golf Impact membership and payment history
        </p>
      </div>

      {/* ── Active Subscription Card ── */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '1.75rem',
            background: isActive
              ? 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.04) 100%)'
              : 'var(--bg-card)',
            borderRadius: '20px',
            border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                  border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CreditCard size={20} color={isActive ? '#34d399' : '#64748b'} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)} Plan
                    </h3>
                    <StatusBadge status={subscription.status} cancelAtPeriodEnd={subscription.cancel_at_period_end} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                {expiryDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <Calendar size={14} color="#64748b" />
                    <span>
                      {subscription.cancel_at_period_end ? 'Access until' : isActive ? 'Renews' : 'Expired'}:
                      {' '}<strong style={{ color: '#e2e8f0' }}>{formatDate(expiryDate)}</strong>
                    </span>
                  </div>
                )}
                {subscription.amount && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <IndianRupee size={14} color="#64748b" />
                    <span>
                      Amount paid: <strong style={{ color: '#e2e8f0' }}>₹{parseFloat(subscription.amount).toFixed(0)}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              {isActive && !subscription.cancel_at_period_end && (
                <button
                  id="cancel-subscription-btn"
                  onClick={() => setShowCancelModal(true)}
                  disabled={loading}
                  style={{
                    padding: '0.625rem 1.125rem', borderRadius: '10px', fontWeight: 600,
                    fontSize: '0.85rem', cursor: 'pointer',
                    background: 'rgba(248,113,113,0.08)', color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.2)',
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <XCircle size={15} /> Cancel
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Security Badge ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.75rem 1.25rem', borderRadius: '12px',
        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
        marginBottom: '2rem', width: 'fit-content',
      }}>
        <Shield size={16} color="#818cf8" />
        <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Secured by <strong style={{ color: '#818cf8' }}>Razorpay</strong> — 256-bit SSL encryption
        </span>
      </div>

      {/* ── Plan Cards ── */}
      {!isActive && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.2rem' }}>Choose Your Plan</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSubscribe}
                loading={loading && activePlanId === plan.id}
                isCurrentPlan={currentPlanId === plan.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upgrade if already subscribed but viewing page */}
      {isActive && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            {subscription?.plan === 'monthly' ? 'Upgrade to Yearly & Save' : 'Your Plans'}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSubscribe}
                loading={loading && activePlanId === plan.id}
                isCurrentPlan={currentPlanId === plan.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Payment History ── */}
      <section>
        <h2 style={{ fontWeight: 800, marginBottom: '1.25rem', fontSize: '1.2rem' }}>
          Transaction History
        </h2>
        {paymentsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Spinner size={28} />
          </div>
        ) : payments.length === 0 ? (
          <div style={{
            padding: '3rem 2rem', textAlign: 'center',
            background: 'var(--bg-card)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Clock size={32} color="#334155" style={{ marginBottom: '0.75rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No transactions yet.</p>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px', overflow: 'hidden',
          }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontSize: '0.875rem' }}>{p.description || p.type}</td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>
                      ₹{parseFloat(p.amount || 0).toFixed(0)}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>
                      {p.provider || 'razorpay'}
                    </td>
                    <td>
                      <span className={`badge ${
                        p.status === 'completed' ? 'badge-success'
                          : p.status === 'failed' ? 'badge-danger'
                          : 'badge-warning'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(p.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Cancel Confirmation Modal ── */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '2rem', maxWidth: '420px', width: '100%',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={22} color="#f87171" />
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              <h3 style={{ fontWeight: 800, marginBottom: '0.625rem', fontSize: '1.1rem' }}>
                Cancel Subscription?
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                You'll retain full access until <strong style={{ color: '#e2e8f0' }}>{formatDate(expiryDate)}</strong>.
                After that, your subscription will not renew and you'll lose access to draws and premium features.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  id="cancel-modal-keep-btn"
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Keep Subscription
                </button>
                <button
                  id="cancel-modal-confirm-btn"
                  onClick={handleCancel}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '10px',
                    background: 'rgba(248,113,113,0.1)', color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.25)', cursor: 'pointer', fontWeight: 700,
                  }}
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .data-table th:nth-child(3) { display: none; }
          .data-table td:nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
}
