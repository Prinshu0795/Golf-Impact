const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const supabase = require('../config/supabase');

// ─── Plan Configuration ───────────────────────────────────────────────────────
const PLANS = {
  monthly: { amount: 79900, currency: 'INR', name: 'Monthly Plan', durationDays: 30 },
  yearly:  { amount: 799900, currency: 'INR', name: 'Yearly Plan',  durationDays: 365 },
};

// ─── POST /api/payments/create-order ─────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Choose monthly or yearly.' });
    }

    const planConfig = PLANS[plan];

    // Razorpay receipt must be ≤ 40 characters
    // rcpt_ (5) + 8 chars of userId + _ (1) + 7-digit timestamp = 21 chars
    const receipt = `rcpt_${req.user.id.slice(0, 8)}_${Date.now().toString().slice(-7)}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount:   planConfig.amount,
      currency: planConfig.currency,
      receipt,
      notes: {
        user_id: req.user.id,
        plan,
        email: req.user.email,
      },
    });


    // Persist order in payments table (pending)
    await supabase.from('payments').insert({
      user_id:          req.user.id,
      provider:         'razorpay',
      provider_order_id: order.id,
      type:             'subscription',
      amount:           planConfig.amount / 100,
      currency:         planConfig.currency,
      status:           'pending',
      description:      `${planConfig.name} subscription`,
    });

    return res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/verify ────────────────────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' });
    }

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: 'Invalid plan.' });
    }

    // ── Signature Verification ──────────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    // ── Replay Protection: check if this payment_id already used ───────────
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('provider_payment_id', razorpay_payment_id)
      .single();

    if (existingPayment) {
      return res.status(409).json({ success: false, message: 'Payment already processed.' });
    }

    const planConfig = PLANS[plan];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);

    // ── Upsert Subscription (insert or update) ────────────────────────────
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      await supabase.from('subscriptions').update({
        plan,
        status:               'active',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        starts_at:            now.toISOString(),
        expires_at:           expiresAt.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end:   expiresAt.toISOString(),
        amount:               planConfig.amount / 100,
        cancel_at_period_end: false,
        cancelled_at:         null,
      }).eq('id', existing.id);
    } else {
      await supabase.from('subscriptions').insert({
        user_id: req.user.id,
        plan,
        status:               'active',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        starts_at:            now.toISOString(),
        expires_at:           expiresAt.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end:   expiresAt.toISOString(),
        amount:               planConfig.amount / 100,
        cancel_at_period_end: false,
      });
    }

    // ── Update Payment Record ──────────────────────────────────────────────
    await supabase
      .from('payments')
      .update({
        provider_payment_id: razorpay_payment_id,
        status:              'completed',
      })
      .eq('provider_order_id', razorpay_order_id);

    return res.json({
      success:    true,
      message:    'Payment verified and subscription activated!',
      expiresAt:  expiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
const handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Razorpay webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const eventType = event.event;

  // ── Persist Event Log ──────────────────────────────────────────────────────
  try {
    await supabase.from('payment_events').insert({
      event_type: eventType,
      payload:    event,
    });
  } catch (logErr) {
    console.error('Failed to log payment event:', logErr.message);
  }

  // ── Handle Events ─────────────────────────────────────────────────────────
  try {
    const payload = event.payload;

    switch (eventType) {
      case 'payment.captured': {
        const payment = payload?.payment?.entity;
        if (payment) {
          await supabase
            .from('payments')
            .update({ status: 'completed', provider_payment_id: payment.id })
            .eq('provider_order_id', payment.order_id);
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload?.payment?.entity;
        if (payment) {
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('provider_order_id', payment.order_id);
        }
        break;
      }

      case 'subscription.charged': {
        const subscription = payload?.subscription?.entity;
        const payment = payload?.payment?.entity;
        if (subscription && payment) {
          const notes = subscription.notes || {};
          const plan = notes.plan;
          if (plan && PLANS[plan]) {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + PLANS[plan].durationDays * 24 * 60 * 60 * 1000);
            await supabase
              .from('subscriptions')
              .update({
                status:               'active',
                razorpay_payment_id:  payment.id,
                current_period_start: now.toISOString(),
                current_period_end:   expiresAt.toISOString(),
                expires_at:           expiresAt.toISOString(),
              })
              .eq('user_id', notes.user_id);
          }
        }
        break;
      }

      case 'subscription.cancelled': {
        const subscription = payload?.subscription?.entity;
        if (subscription) {
          const notes = subscription.notes || {};
          if (notes.user_id) {
            await supabase
              .from('subscriptions')
              .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
              .eq('user_id', notes.user_id);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${eventType}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

module.exports = { createOrder, verifyPayment, handleWebhook };
