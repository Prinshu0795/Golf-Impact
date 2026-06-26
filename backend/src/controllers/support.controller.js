const supabase = require('../config/supabase');

// POST /api/support/message — public
const createMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    // Basic email validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const { error } = await supabase.from('support_messages').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      status: 'open',
    });

    if (error) throw error;

    return res.json({ success: true, message: 'Your message has been received. We\'ll get back to you soon!' });
  } catch (err) {
    next(err);
  }
};

// GET /api/support/messages — admin only
const getMessages = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, messages: data });
  } catch (err) {
    next(err);
  }
};

// PUT /api/support/messages/:id/status — admin only
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase
      .from('support_messages')
      .update({ 
        status: status, 
        resolved_at: status === 'resolved' ? new Date().toISOString() : null 
      })
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Message status updated.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/support/messages/:id — admin only
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('support_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMessage, getMessages, updateStatus, deleteMessage };
