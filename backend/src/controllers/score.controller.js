const supabase = require('../config/supabase');

const MAX_SCORES = 5;
const MIN_SCORE = 1;
const MAX_SCORE = 45;

// GET /api/scores - Get user's scores (newest first)
const getScores = async (req, res, next) => {
  try {
    const { data: scores, error } = await supabase
      .from('scores')
      .select('id, score, score_date, notes, created_at')
      .eq('user_id', req.user.id)
      .order('score_date', { ascending: false })
      .limit(MAX_SCORES);

    if (error) throw error;

    res.json({ success: true, scores });
  } catch (err) {
    next(err);
  }
};

// POST /api/scores - Add a new score
const addScore = async (req, res, next) => {
  try {
    const { score, score_date, notes } = req.body;

    // Validation
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < MIN_SCORE || scoreNum > MAX_SCORE) {
      return res.status(400).json({
        success: false,
        message: `Score must be between ${MIN_SCORE} and ${MAX_SCORE}.`,
      });
    }

    if (!score_date) {
      return res.status(400).json({ success: false, message: 'Score date is required.' });
    }

    // Check for duplicate date
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('score_date', score_date)
      .single();

    if (existing) {
      return res.status(409).json({ success: false, message: 'You already have a score for this date.' });
    }

    // Get current scores count
    const { data: currentScores, error: fetchError } = await supabase
      .from('scores')
      .select('id, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    // If at max capacity, delete the oldest
    if (currentScores.length >= MAX_SCORES) {
      const oldest = currentScores[0];
      await supabase.from('scores').delete().eq('id', oldest.id);
    }

    // Insert new score
    const { data: newScore, error } = await supabase
      .from('scores')
      .insert({
        user_id: req.user.id,
        score: scoreNum,
        score_date,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: currentScores.length >= MAX_SCORES
        ? 'Score added. Your oldest score was replaced.'
        : 'Score added successfully!',
      score: newScore,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/scores/:id - Edit a score
const updateScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score, score_date, notes } = req.body;

    // Check ownership
    const { data: existing, error: findError } = await supabase
      .from('scores')
      .select('id, score_date')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ success: false, message: 'Score not found.' });
    }

    // Validate score
    if (score !== undefined) {
      const scoreNum = parseInt(score);
      if (isNaN(scoreNum) || scoreNum < MIN_SCORE || scoreNum > MAX_SCORE) {
        return res.status(400).json({
          success: false,
          message: `Score must be between ${MIN_SCORE} and ${MAX_SCORE}.`,
        });
      }
    }

    // Check for duplicate date (if date is changing)
    if (score_date && score_date !== existing.score_date) {
      const { data: dupDate } = await supabase
        .from('scores')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('score_date', score_date)
        .neq('id', id)
        .single();

      if (dupDate) {
        return res.status(409).json({ success: false, message: 'You already have a score for this date.' });
      }
    }

    const updates = {};
    if (score !== undefined) updates.score = parseInt(score);
    if (score_date !== undefined) updates.score_date = score_date;
    if (notes !== undefined) updates.notes = notes;

    const { data: updated, error } = await supabase
      .from('scores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Score updated successfully!', score: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/scores/:id - Delete a score
const deleteScore = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, message: 'Score deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getScores, addScore, updateScore, deleteScore };
