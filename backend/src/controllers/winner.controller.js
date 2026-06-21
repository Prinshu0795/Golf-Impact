const supabase = require('../config/supabase');

// GET /api/winners/my-winnings
const getMyWinnings = async (req, res, next) => {
  try {
    const { data: winnings, error } = await supabase
      .from('winner_verifications')
      .select(`
        id, prize_amount, proof_url, status, admin_notes, reviewed_at, paid_at, created_at,
        draws (id, draw_type, winning_numbers, draw_date, prize_pool)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, winnings });
  } catch (err) {
    next(err);
  }
};

// POST /api/winners/:id/upload-proof
const uploadProof = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: verification } = await supabase
      .from('winner_verifications')
      .select('id, user_id, status')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found.' });
    }

    if (verification.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot upload proof for a ${verification.status} verification.` });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const proof_url = `/uploads/proofs/${req.file.filename}`;

    const { data: updated, error } = await supabase
      .from('winner_verifications')
      .update({ proof_url, proof_filename: req.file.originalname })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Proof uploaded successfully!', verification: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/winners (admin) - List all verifications
const getAllVerifications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('winner_verifications')
      .select(`
        id, prize_amount, proof_url, status, admin_notes, reviewed_at, paid_at, created_at,
        users!winner_verifications_user_id_fkey (id, full_name, email),
        draws (id, draw_type, draw_date)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);

    const { data: verifications, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      verifications,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/winners/:id/review (admin)
const reviewVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const { data: updated, error } = await supabase
      .from('winner_verifications')
      .update({
        status,
        admin_notes: admin_notes || null,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: `Verification ${status}!`, verification: updated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/winners/:id/mark-paid (admin)
const markPaid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: updated, error } = await supabase
      .from('winner_verifications')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'approved')
      .select()
      .single();

    if (error || !updated) {
      return res.status(400).json({ success: false, message: 'Only approved verifications can be marked as paid.' });
    }

    res.json({ success: true, message: 'Marked as paid!', verification: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyWinnings, uploadProof, getAllVerifications, reviewVerification, markPaid };
