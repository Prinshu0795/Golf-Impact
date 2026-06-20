const supabase = require('../config/supabase');

// ─── GET /api/subscriptions/status ────────────────────────────────────────────
const getSubscriptionStatus = async (req, res, next) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Auto-expire if period has ended
    if (subscription && subscription.status === 'active') {
      const expiryCol = subscription.expires_at || subscription.current_period_end;
      if (expiryCol && new Date(expiryCol) < new Date()) {
        await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id);
        subscription.status = 'expired';
      }
    }

    return res.json({ success: true, subscription: subscription || null });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/subscriptions/cancel ───────────────────────────────────────────
const cancelSubscription = async (req, res, next) => {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found.' });
    }

    // Mark as cancelled in DB — user retains access until expires_at
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    return res.json({
      success: true,
      message: 'Subscription cancelled. You retain access until the end of your current billing period.',
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/subscriptions/payments ──────────────────────────────────────────
const getPaymentHistory = async (req, res, next) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubscriptionStatus,
  cancelSubscription,
  getPaymentHistory,
};
