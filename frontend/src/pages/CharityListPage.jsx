import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { charityService } from '../services';
import { Search, Filter, Heart, ExternalLink } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function CharityListPage() {
  const [charities, setCharities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const [charRes, catRes] = await Promise.all([
        charityService.getCharities({ search: search || undefined, category: activeCategory || undefined }),
        charityService.getCategories(),
      ]);
      setCharities(charRes.charities || []);
      setCategories(catRes.categories || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, [search, activeCategory]);

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '3rem 1.5rem 2rem', background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.08) 0%, transparent 60%)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Our Partner <span className="gradient-text-green">Charities</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Choose the cause you want to support. Minimum 10% of every winning goes to your charity.
          </motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="text"
              className="input-field" placeholder="Search charities..." style={{ paddingLeft: '2.75rem', borderRadius: '9999px' }} />
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['', ...categories].map((cat) => (
            <button key={cat || 'all'} onClick={() => setActiveCategory(cat)}
              style={{ padding: '0.375rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: activeCategory === cat ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: activeCategory === cat ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: activeCategory === cat ? '#34d399' : '#94a3b8',
              }}>
              {cat || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><Spinner size={36} /></div>
        ) : charities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>No charities found. Try adjusting your search.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {charities.map((charity, i) => (
              <motion.div key={charity.id} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                {charity.is_featured && (
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', padding: '0.15rem 0.6rem', borderRadius: '6px', display: 'inline-block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ⭐ Featured
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{charity.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Heart size={13} fill="#34d399" /> ${parseFloat(charity.total_raised || 0).toLocaleString()} raised
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{charity.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem' }}>{charity.short_description}</p>
                <Link to={`/charities/${charity.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                  View Profile <ExternalLink size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
