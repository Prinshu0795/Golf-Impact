const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// GET /api/admin/stats - Dashboard analytics
const getStats = async (req, res, next) => {
  try {
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalDraws },
      { count: pendingVerifications },
      { data: recentPayments },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('draws').select('*', { count: 'exact', head: true }),
      supabase.from('winner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('payments').select('amount, type, status').eq('status', 'completed').order('created_at', { ascending: false }).limit(10),
    ]);

    const totalRevenue = (recentPayments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        totalDraws,
        pendingVerifications,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('users')
      .select(`
        id, email, full_name, role, is_active, donation_pct, created_at,
        charities (name),
        subscriptions (plan, status, current_period_end)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) query = query.ilike('email', `%${search}%`);
    if (role) query = query.eq('role', role);

    const { data: users, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, role, is_active, donation_pct } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    if (donation_pct !== undefined) updates.donation_pct = parseFloat(donation_pct);

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, full_name, role, is_active, donation_pct')
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'User updated!', user });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users/:id/scores
const getUserScores = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', id)
      .order('score_date', { ascending: false });

    if (error) throw error;
    res.json({ success: true, scores });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/scores/:id
const adminUpdateScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, score_date, notes } = req.body;

    const updates = {};
    if (score !== undefined) {
      const s = parseInt(score);
      if (s < 1 || s > 45) {
        return res.status(400).json({ success: false, message: 'Score must be between 1 and 45.' });
      }
      updates.score = s;
    }
    if (score_date !== undefined) updates.score_date = score_date;
    if (notes !== undefined) updates.notes = notes;

    const { data: updated, error } = await supabase
      .from('scores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Score updated!', score: updated });
  } catch (err) {
    next(err);
  }
};

// Charity management
const getAdminCharities = async (req, res, next) => {
  try {
    const { data: charities, error } = await supabase
      .from('charities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, charities });
  } catch (err) {
    next(err);
  }
};

const createCharity = async (req, res, next) => {
  try {
    const { name, description, short_description, category, website, is_featured } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Charity name is required.' });

    const { data: charity, error } = await supabase
      .from('charities')
      .insert({ name, description, short_description, category, website, is_featured: is_featured || false })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Charity created!', charity });
  } catch (err) {
    next(err);
  }
};

const updateCharity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, short_description, category, website, is_featured, is_active } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (short_description !== undefined) updates.short_description = short_description;
    if (category !== undefined) updates.category = category;
    if (website !== undefined) updates.website = website;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data: charity, error } = await supabase
      .from('charities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Charity updated!', charity });
  } catch (err) {
    next(err);
  }
};

const deleteCharity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete
    const { error } = await supabase
      .from('charities')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Charity deactivated.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUser,
  getUserScores,
  adminUpdateScore,
  getAdminCharities,
  createCharity,
  updateCharity,
  deleteCharity,
};
