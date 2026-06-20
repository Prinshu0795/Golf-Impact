const supabase = require('../config/supabase');

// Draw type to numbers count mapping
const DRAW_TYPE_NUMBERS = {
  '3match': 3,
  '4match': 4,
  '5match': 5,
};

// Prize pool allocation percentages
const PRIZE_ALLOCATION = {
  '5match': 0.40,
  '4match': 0.35,
  '3match': 0.25,
};

// Score range for draw numbers
const MIN_NUMBER = 1;
const MAX_NUMBER = 45;

/**
 * Generate random draw numbers
 */
const generateRandomNumbers = (count) => {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Generate weighted numbers based on user score frequencies
 */
const generateAlgorithmicNumbers = async (count) => {
  // Aggregate all user scores and weight by frequency
  const { data: scores } = await supabase
    .from('scores')
    .select('score');

  if (!scores || scores.length === 0) {
    return generateRandomNumbers(count);
  }

  // Build frequency map
  const frequencyMap = {};
  scores.forEach(({ score }) => {
    frequencyMap[score] = (frequencyMap[score] || 0) + 1;
  });

  // Build weighted array
  const weightedPool = [];
  Object.entries(frequencyMap).forEach(([score, freq]) => {
    for (let i = 0; i < freq; i++) {
      weightedPool.push(parseInt(score));
    }
  });

  // Select unique weighted numbers
  const selected = new Set();
  let attempts = 0;
  while (selected.size < count && attempts < 1000) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    selected.add(weightedPool[idx]);
    attempts++;
  }

  // Fill remaining with random if needed
  while (selected.size < count) {
    selected.add(Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER);
  }

  return Array.from(selected).sort((a, b) => a - b);
};

/**
 * Count matches between user numbers and winning numbers
 */
const countMatches = (userNumbers, winningNumbers) => {
  const winningSet = new Set(winningNumbers);
  return userNumbers.filter((n) => winningSet.has(n)).length;
};

/**
 * Get all eligible users (active subscription) and their latest scores as their numbers
 */
const getEligibleEntries = async () => {
  const { data: users } = await supabase
    .from('users')
    .select(`
      id,
      subscriptions!inner (status),
      scores (score, score_date)
    `)
    .eq('subscriptions.status', 'active');

  if (!users) return [];

  return users.map((user) => {
    // Use their scores sorted newest first as their "numbers played"
    const latestScores = (user.scores || [])
      .sort((a, b) => new Date(b.score_date) - new Date(a.score_date))
      .slice(0, 5)
      .map((s) => s.score);

    return {
      user_id: user.id,
      numbers_played: latestScores,
    };
  }).filter((e) => e.numbers_played.length > 0);
};

/**
 * Simulate a draw (doesn't save to DB)
 */
const simulate = async ({ draw_type, mode, draw_date, prize_pool }) => {
  const count = DRAW_TYPE_NUMBERS[draw_type];

  const winningNumbers =
    mode === 'algorithmic'
      ? await generateAlgorithmicNumbers(count)
      : generateRandomNumbers(count);

  const entries = await getEligibleEntries();
  const winners = entries
    .map((entry) => ({ ...entry, matches: countMatches(entry.numbers_played.slice(0, count), winningNumbers) }))
    .filter((e) => e.matches >= count)
    .map((e) => ({ ...e, prize_share: prize_pool / Math.max(1, entries.filter((x) => countMatches(x.numbers_played.slice(0, count), winningNumbers) >= count).length) }));

  return {
    draw_type,
    mode,
    draw_date,
    winning_numbers: winningNumbers,
    total_entries: entries.length,
    winners_count: winners.length,
    prize_pool,
    simulated: true,
  };
};

/**
 * Run actual draw and save to database
 */
const runDraw = async ({ draw_type, mode, draw_date, jackpot_amount, created_by }) => {
  const count = DRAW_TYPE_NUMBERS[draw_type];

  const winningNumbers =
    mode === 'algorithmic'
      ? await generateAlgorithmicNumbers(count)
      : generateRandomNumbers(count);

  // Calculate prize from subscriptions (simplified)
  const { count: activeSubCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const monthlyRevenue = (activeSubCount || 0) * 9.99;
  const prize_pool = monthlyRevenue * PRIZE_ALLOCATION[draw_type] + jackpot_amount;

  // Create draw record
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .insert({
      draw_type,
      mode,
      winning_numbers: winningNumbers,
      prize_pool,
      jackpot_amount,
      status: 'simulated',
      draw_date,
      created_by,
    })
    .select()
    .single();

  if (drawError) throw drawError;

  // Get eligible entries and save them
  const entries = await getEligibleEntries();
  const entryInserts = entries.map((entry) => ({
    draw_id: draw.id,
    user_id: entry.user_id,
    numbers_played: entry.numbers_played.slice(0, count),
    matches: countMatches(entry.numbers_played.slice(0, count), winningNumbers),
    is_winner: countMatches(entry.numbers_played.slice(0, count), winningNumbers) >= count,
  }));

  if (entryInserts.length > 0) {
    await supabase.from('draw_entries').insert(entryInserts);
  }

  return draw;
};

/**
 * Create winner verification records after publish
 */
const createWinnerVerifications = async (drawId) => {
  const { data: draw } = await supabase
    .from('draws')
    .select('prize_pool, winning_numbers, draw_type')
    .eq('id', drawId)
    .single();

  const { data: winnerEntries } = await supabase
    .from('draw_entries')
    .select('id, user_id')
    .eq('draw_id', drawId)
    .eq('is_winner', true);

  if (!winnerEntries || winnerEntries.length === 0) {
    // Jackpot rolls over
    await supabase.from('draws').update({ jackpot_rolled_over: true }).eq('id', drawId);
    return;
  }

  const prizeShare = (draw.prize_pool || 0) / winnerEntries.length;

  const verifications = winnerEntries.map((entry) => ({
    user_id: entry.user_id,
    draw_id: drawId,
    draw_entry_id: entry.id,
    prize_amount: prizeShare,
    status: 'pending',
  }));

  await supabase.from('winner_verifications').insert(verifications);
};

module.exports = { simulate, runDraw, createWinnerVerifications, generateRandomNumbers };
