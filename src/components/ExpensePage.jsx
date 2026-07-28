import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { toDateKey } from '../lib/date';
import { formatRupiah } from '../lib/format';

const todayKey = toDateKey(new Date());

export default function ExpensePage() {
  const [date, setDate] = useState(todayKey);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (d) => {
    setLoading(true);
    try {
      setExpenses(await api.getExpensesForDate(d));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  async function handleAdd() {
    const amountNum = Number(amount);
    if (!label.trim() || !amountNum) return;
    setSubmitting(true);
    setError(null);
    try {
      const expense = await api.addExpense({ date, label: label.trim(), amount: amountNum });
      setExpenses((prev) => [...prev, expense]);
      setLabel('');
      setAmount('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id) {
    setError(null);
    try {
      await api.removeExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const isToday = date === todayKey;

  return (
    <div>
      <h1 className="font-heading text-lg text-ink mb-1">Pengeluaran</h1>
      <p className="text-sm text-muted mb-4">Catat pengeluaran harianmu 💸</p>

      {error && (
        <div className="text-xs rounded-2xl p-3 mb-4 border border-border bg-surface text-ink">⚠️ {error}</div>
      )}

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs text-muted" htmlFor="expense-date">
            Tanggal
          </label>
          <input
            id="expense-date"
            type="date"
            value={date}
            max={todayKey}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-border bg-surface-alt px-2 py-1 text-sm text-ink outline-none"
          />
        </div>
        <p className="text-right font-heading text-2xl text-ink mt-2">{formatRupiah(total)}</p>
        <p className="text-right text-xs text-muted">{isToday ? 'Total hari ini' : 'Total tanggal ini'}</p>
      </section>

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <h2 className="font-heading text-sm text-ink mb-3">Daftar pengeluaran</h2>
        {loading ? (
          <div className="flex justify-center py-6 gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full animate-bounce-dot"
                style={{ background: 'var(--color-primary)', animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">Belum ada catatan pengeluaran.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence>
              {expenses.map((e) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold bg-surface-alt"
                >
                  <span className="text-ink">{e.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-ink">{formatRupiah(e.amount)}</span>
                    <button
                      type="button"
                      aria-label={`Hapus ${e.label}`}
                      onClick={() => handleRemove(e.id)}
                      className="text-muted active:scale-90 transition-transform"
                    >
                      ✕
                    </button>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <section className="rounded-3xl p-4 mb-4 shadow-soft bg-surface border border-border">
        <h2 className="font-heading text-sm text-ink mb-3">Tambah pengeluaran</h2>
        <div className="flex gap-2 mb-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Kopi susu"
            aria-label="Nama pengeluaran"
            maxLength={80}
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm outline-none text-ink placeholder:opacity-50"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="20000"
            aria-label="Jumlah pengeluaran"
            className="w-24 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm outline-none text-ink placeholder:opacity-50"
          />
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          disabled={!label.trim() || !Number(amount) || submitting}
          className="w-full rounded-xl py-2.5 text-sm font-heading font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
        >
          {submitting ? 'Menyimpan…' : 'Tambah'}
        </motion.button>
      </section>
    </div>
  );
}
