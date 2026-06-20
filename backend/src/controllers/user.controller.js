const supabase = require('../config/supabase');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, charity_id, donation_pct, avatar_url, phone, created_at, charities (id, name, image_url, short_description)')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, donation_pct } = req.body;
    const updates = {};

    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (donation_pct !== undefined) {
      const pct = parseFloat(donation_pct);
      if (isNaN(pct) || pct < 10 || pct > 100) {
        return res.status(400).json({ success: false, message: 'Donation percentage must be between 10 and 100.' });
      }
      updates.donation_pct = pct;
    }

    if (req.file) {
      updates.avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, email, full_name, role, charity_id, donation_pct, avatar_url, phone')
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Profile updated!', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
