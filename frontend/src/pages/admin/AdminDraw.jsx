import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useToast } from '../../context/ToastContext';
import { drawService } from '../../services';
import { Play, Shuffle, Eye, Check, AlertCircle, Loader } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function AdminDraw() {
  const { success, error } = useToast();
  const [simResult, setSimResult] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('simulate');

  const { register, handleSubmit, watch } = useForm({ defaultValues: { draw_type: '5match', mode: 'random', jackpot_amount: 0 } });

  const onSimulate = async (data) => {
    setLoading(true);
    try {
      const res = await drawService.simulate(data);
      setSimResult(res.result);
      success('Draw simulated!');
    } catch (e) { error(e.message); }
    finally { setLoading(false); }
  };

  const onRunDraw = async (data) => {
    if (!confirm('Run and save this draw? This action cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await drawService.runDraw(data);
      setRunResult(res.draw);
      success('Draw executed and saved!');
    } catch (e) { error(e.message); }
    finally { setLoading(false); }
  };

  const onPublish = async () => {
    if (!runResult) return;
    setLoading(true);
    try {
      await drawService.publishDraw(runResult.id);
      success('Draw published! Winner verifications created.');
      setRunResult(null);
    } catch (e) { error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Draw Engine</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure, simulate, run, and publish draws</p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['simulate', 'run'].map((m) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
              background: mode === m ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: mode === m ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--bg-border-light)',
              color: mode === m ? 'var(--color-primary-light)' : 'var(--text-muted)',
            }}>
            {m === 'simulate' ? '🧪 Simulate' : '🎲 Run Draw'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Config Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Draw Configuration</h3>
          <form onSubmit={handleSubmit(mode === 'simulate' ? onSimulate : onRunDraw)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Draw Type</label>
              <select {...register('draw_type')} className="input-field">
                <option value="5match">5 Match (40% prize pool)</option>
                <option value="4match">4 Match (35% prize pool)</option>
                <option value="3match">3 Match (25% prize pool)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Draw Mode</label>
              <select {...register('mode')} className="input-field">
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic (Weighted by score frequency)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Draw Date</label>
              <input {...register('draw_date')} type="date" className="input-field" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Jackpot Rollover ($)</label>
              <input {...register('jackpot_amount')} type="number" min="0" step="0.01" className="input-field" placeholder="0.00" />
            </div>
            {mode === 'simulate' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Prize Pool ($)</label>
                <input {...register('prize_pool')} type="number" min="0" step="0.01" className="input-field" placeholder="0.00" />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
              {loading ? <><Spinner size={16} color="white" /> Processing...</> : mode === 'simulate' ? <><Eye size={16} /> Simulate Draw</> : <><Play size={16} /> Run Draw</>}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <div>
          {simResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)', padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-primary-light)' }}>🧪 Simulation Results</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Winning Numbers</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {simResult.winning_numbers?.map((n) => (
                      <span key={n} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-primary-light)', fontFamily: 'Outfit' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[['Total Entries', simResult.total_entries], ['Winners', simResult.winners_count], ['Mode', simResult.mode], ['Type', simResult.draw_type]].map(([l, v]) => (
                    <div key={l} style={{ background: 'var(--bg-border-light)', borderRadius: '8px', padding: '0.625rem' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l}</p>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {runResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#34d399' }}>✅ Draw Saved</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Draw #{runResult.id?.slice(0, 8)} has been created with status: <strong style={{ color: '#fbbf24' }}>{runResult.status}</strong></p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {runResult.winning_numbers?.map((n) => (
                  <span key={n} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#34d399', fontFamily: 'Outfit' }}>
                    {n}
                  </span>
                ))}
              </div>
              <button onClick={onPublish} disabled={loading} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {loading ? <Spinner size={16} color="white" /> : <Check size={16} />} Publish Draw & Notify Winners
              </button>
            </motion.div>
          )}

          {!simResult && !runResult && (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--bg-border-light)', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎲</div>
              <p>Configure and run a draw to see results here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
