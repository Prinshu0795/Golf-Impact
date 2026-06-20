const supabase = require('../config/supabase');

// GET /api/charities - List all active charities
const getCharities = async (req, res, next) => {
  try {
    const { search, category, featured } = req.query;

    let query = supabase
      .from('charities')
      .select('id, name, short_description, description, image_url, category, is_featured, total_raised')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('name');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data: charities, error } = await query;
    if (error) throw error;

    res.json({ success: true, charities });
  } catch (err) {
    next(err);
  }
};

// GET /api/charities/:id - Get charity profile
const getCharityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: charity, error } = await supabase
      .from('charities')
      .select(`
        *,
        charity_events (id, title, description, event_date, image_url)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .order('event_date', { foreignTable: 'charity_events', ascending: false })
      .single();

    if (error || !charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    // Get donor count
    const { count: donorCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('charity_id', id);

    res.json({ success: true, charity: { ...charity, donor_count: donorCount } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/charities/select - User selects a charity
const selectCharity = async (req, res, next) => {
  try {
    const { charity_id, donation_pct = 10 } = req.body;

    if (!charity_id) {
      return res.status(400).json({ success: false, message: 'Charity ID is required.' });
    }

    const pct = parseFloat(donation_pct);
    if (isNaN(pct) || pct < 10 || pct > 100) {
      return res.status(400).json({ success: false, message: 'Donation percentage must be between 10% and 100%.' });
    }

    // Verify charity exists
    const { data: charity } = await supabase
      .from('charities')
      .select('id')
      .eq('id', charity_id)
      .eq('is_active', true)
      .single();

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ charity_id, donation_pct: pct })
      .eq('id', req.user.id)
      .select('id, charity_id, donation_pct')
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Charity selection updated!', user });
  } catch (err) {
    next(err);
  }
};

// GET /api/charities/categories - Get distinct categories
const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);

    if (error) throw error;

    const categories = [...new Set(data.map((c) => c.category))].sort();
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCharities, getCharityById, selectCharity, getCategories };
