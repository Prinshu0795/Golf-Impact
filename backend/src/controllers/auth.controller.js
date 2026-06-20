const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { signToken, cookieOptions } = require('../config/jwt');

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { email, password, full_name, charity_id, donation_pct = 10 } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    if (donation_pct < 10 || donation_pct > 100) {
      return res.status(400).json({ success: false, message: 'Donation percentage must be between 10% and 100%.' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        charity_id: charity_id || null,
        donation_pct: parseFloat(donation_pct),
      })
      .select('id, email, full_name, role, charity_id, donation_pct')
      .single();

    if (error) throw error;

    // Sign token
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, charity_id: user.charity_id, donation_pct: user.donation_pct },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user with password
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, password_hash, is_active, charity_id, donation_pct')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, cookieOptions);

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, full_name, role, charity_id, donation_pct, avatar_url, phone, created_at,
        charities (id, name, short_description, image_url),
        subscriptions (id, plan, status, current_period_end, cancel_at_period_end)
      `)
      .eq('id', req.user.id)
      .order('created_at', { foreignTable: 'subscriptions', ascending: false })
      .limit(1, { foreignTable: 'subscriptions' })
      .single();

    if (error) throw error;

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const password_hash = await bcrypt.hash(new_password, 12);
    await supabase.from('users').update({ password_hash }).eq('id', req.user.id);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, getMe, changePassword };
