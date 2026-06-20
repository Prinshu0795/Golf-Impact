const supabase = require('../config/supabase');
const drawService = require('../services/draw.service');

// GET /api/draws - Get all published draws
const getDraws = async (req, res, next) => {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('id, draw_type, mode, winning_numbers, prize_pool, jackpot_amount, status, draw_date, published_at')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ success: true, draws });
  } catch (err) {
    next(err);
  }
};

// GET /api/draws/:id - Get single draw with results
const getDrawById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: draw, error } = await supabase
      .from('draws')
      .select(`
        *,
        draw_entries!draw_entries_draw_id_fkey (
          id, user_id, numbers_played, matches, is_winner,
          users (full_name, email)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !draw) {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    // Only show entries if user is admin or it's their own entry
    if (req.user?.role !== 'admin') {
      draw.draw_entries = draw.draw_entries?.filter((e) => e.user_id === req.user?.id);
    }

    res.json({ success: true, draw });
  } catch (err) {
    next(err);
  }
};

// GET /api/draws/my-results - User's draw history
const getMyDrawResults = async (req, res, next) => {
  try {
    const { data: entries, error } = await supabase
      .from('draw_entries')
      .select(`
        id, numbers_played, matches, is_winner, created_at,
        draws (id, draw_type, winning_numbers, prize_pool, draw_date, status)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, entries });
  } catch (err) {
    next(err);
  }
};

// POST /api/draws/simulate (admin)
const simulateDraw = async (req, res, next) => {
  try {
    const { draw_type = '5match', mode = 'random', draw_date, prize_pool = 0 } = req.body;

    const result = await drawService.simulate({ draw_type, mode, draw_date: draw_date || new Date().toISOString().split('T')[0], prize_pool });

    res.json({ success: true, message: 'Draw simulated successfully!', result });
  } catch (err) {
    next(err);
  }
};

// POST /api/draws/run (admin) - Run actual draw and save
const runDraw = async (req, res, next) => {
  try {
    const { draw_type = '5match', mode = 'random', draw_date, jackpot_amount = 0 } = req.body;

    const result = await drawService.runDraw({
      draw_type,
      mode,
      draw_date: draw_date || new Date().toISOString().split('T')[0],
      jackpot_amount: parseFloat(jackpot_amount),
      created_by: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Draw executed and saved!', draw: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/draws/:id/publish (admin) - Publish draw results
const publishDraw = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: draw } = await supabase
      .from('draws')
      .select('id, status')
      .eq('id', id)
      .single();

    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found.' });
    if (draw.status === 'published') {
      return res.status(400).json({ success: false, message: 'Draw is already published.' });
    }

    const { data: updated, error } = await supabase
      .from('draws')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create winner verification records for winners
    await drawService.createWinnerVerifications(id);

    res.json({ success: true, message: 'Draw published!', draw: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDraws, getDrawById, getMyDrawResults, simulateDraw, runDraw, publishDraw };
