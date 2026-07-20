import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getIncome, addIncome, deleteIncome,
  getExpenses, addExpense, deleteExpense,
  getFinanceSummary, getMonthlyChartData
} from '../../services/financeService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import Papa from 'papaparse'

const EXPENSE_CATS = ['Raw Materials','Utilities','Salaries','Rent','Delivery','Marketing','Equipment','Miscellaneous']

export default function Finance() {
  const qc = useQueryClient()
  const [period, setPeriod] = useState('monthly')
  const [modal, setModal] = useState(null) // 'income' | 'expense'
  const [tab, setTab] = useState('income') // 'income' | 'expense'
  const [incForm, setIncForm] = useState({ source:'', amount:'', date: new Date().toISOString().split('T')[0], notes:'' })
  const [expForm, setExpForm] = useState({ category:'Raw Materials', amount:'', date: new Date().toISOString().split('T')[0], notes:'' })
  const [saving, setSaving] = useState(false)

  const { data: income = [] }   = useQuery({ queryKey: ['income'],   queryFn: getIncome })
  const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: getExpenses })
  const { data: summary }       = useQuery({ queryKey: ['finance', period], queryFn: () => getFinanceSummary(period) })
  const { data: chartData = [] } = useQuery({ queryKey: ['chart'], queryFn: getMonthlyChartData })

  const delIncome  = useMutation({ mutationFn: deleteIncome,  onSuccess: () => { qc.invalidateQueries(['income']);   toast.success('Income entry deleted') } })
  const delExpense = useMutation({ mutationFn: deleteExpense, onSuccess: () => { qc.invalidateQueries(['expenses']); toast.success('Expense entry deleted') } })

  const si = (k) => (e) => setIncForm(f => ({ ...f, [k]: e.target.value }))
  const se = (k) => (e) => setExpForm(f => ({ ...f, [k]: e.target.value }))

  const handleAddIncome = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await addIncome({ ...incForm, amount: Number(incForm.amount) })
      qc.invalidateQueries(['income']); qc.invalidateQueries(['finance'])
      toast.success('Income added!'); setModal(null)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await addExpense({ ...expForm, amount: Number(expForm.amount) })
      qc.invalidateQueries(['expenses']); qc.invalidateQueries(['finance'])
      toast.success('Expense added!'); setModal(null)
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Crown & Crust — Finance Report', 14, 20)
    doc.setFontSize(11)
    doc.text(`Period: ${period} | Generated: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Income: Rs.${(summary?.totalIncome || 0).toFixed(2)}`, 14, 42)
    doc.text(`Total Expense: Rs.${(summary?.totalExpense || 0).toFixed(2)}`, 14, 50)
    doc.text(`Net Profit: Rs.${(summary?.netProfit || 0).toFixed(2)}`, 14, 58)
    doc.setFontSize(12)
    doc.text('Income Entries', 14, 72)
    let y = 80
    income.forEach(i => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.setFontSize(9)
      doc.text(`${i.date}  ${i.source}  Rs.${i.amount}`, 14, y)
      y += 7
    })
    doc.save('crown-crust-finance.pdf')
    toast.success('PDF exported!')
  }

  // Export CSV
  const exportCSV = () => {
    const data = [
      ...income.map(i => ({ type:'Income', source: i.source, category:'', amount: i.amount, date: i.date, notes: i.notes })),
      ...expenses.map(e => ({ type:'Expense', source:'', category: e.category, amount: e.amount, date: e.date, notes: e.notes })),
    ]
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'crown-crust-finance.csv'; a.click()
    toast.success('CSV exported!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-espresso-800">Finance</h1>
          <p className="text-sandalwood-500 text-sm mt-0.5">Income, expenses & profit tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={exportCSV} className="flex items-center gap-2 text-sm px-4 py-2">
            <Download size={15} /> CSV
          </Button>
          <Button variant="ghost" onClick={exportPDF} className="flex items-center gap-2 text-sm px-4 py-2">
            <Download size={15} /> PDF
          </Button>
          <Button onClick={() => setModal('income')} variant="secondary" className="flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={15} /> Income
          </Button>
          <Button onClick={() => setModal('expense')} variant="primary" className="flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={15} /> Expense
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label:'Total Income', value: summary?.totalIncome, icon: TrendingUp, color:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-600', iconBg:'bg-emerald-500' },
          { label:'Total Expense', value: summary?.totalExpense, icon: TrendingDown, color:'bg-red-50', border:'border-red-200', text:'text-red-600', iconBg:'bg-red-500' },
          { label:'Net Profit', value: summary?.netProfit, icon: DollarSign, color:'bg-amber-50', border:'border-amber-200', text: summary?.netProfit >= 0 ? 'text-emerald-600':'text-red-600', iconBg:'bg-amber-500' },
        ].map(({ label, value, icon: Icon, color, border, text, iconBg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i*0.08 }}
            className={`${color} border ${border} rounded-2xl p-5 flex items-center gap-4`}
          >
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-espresso-500 mb-0.5">{label}</p>
              <p className={`font-serif text-2xl font-semibold ${text}`}>₹{(value || 0).toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Period picker + chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-espresso-800">Monthly Trend</h2>
          <div className="flex gap-2">
            {['weekly','monthly','yearly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-espresso-800 text-white' : 'bg-sandalwood-100 text-espresso-600 hover:bg-sandalwood-200'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top:5, right:5, bottom:5, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eed9c0" />
            <XAxis dataKey="month" tick={{ fontSize:12, fill:'#9a7050' }} />
            <YAxis tick={{ fontSize:12, fill:'#9a7050' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius:12, border:'1px solid #e2c09a', background:'#fdf8f3' }} formatter={(v) => [`₹${v.toLocaleString()}`, undefined]} />
            <Legend />
            <Bar dataKey="income"  fill="#16a34a" radius={[4,4,0,0]} name="Income"  />
            <Bar dataKey="expense" fill="#dc2626" radius={[4,4,0,0]} name="Expense" />
            <Bar dataKey="profit"  fill="#C2A177" radius={[4,4,0,0]} name="Profit"  />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Income / Expense tabs */}
      <div className="glass-card overflow-hidden">
        <div className="flex border-b border-sandalwood-200">
          {['income','expense'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${tab === t ? 'border-b-2 border-espresso-800 text-espresso-800' : 'text-sandalwood-500 hover:text-espresso-700'}`}>
              {t} ({t === 'income' ? income.length : expenses.length})
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-sandalwood-50 border-b border-sandalwood-200">
                {tab === 'income'
                  ? ['Source','Amount','Date','Notes',''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">{h}</th>)
                  : ['Category','Amount','Date','Notes',''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">{h}</th>)
                }
              </tr>
            </thead>
            <tbody>
              {(tab === 'income' ? income : expenses).map((row, i) => (
                <motion.tr key={row.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.03 }}
                  className="border-b border-sandalwood-100 hover:bg-sandalwood-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-espresso-800">{tab === 'income' ? row.source : row.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <span className={tab === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                      {tab === 'income' ? '+' : '-'}₹{Number(row.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-sandalwood-500">{row.date}</td>
                  <td className="px-4 py-3 text-xs text-sandalwood-400">{row.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => tab === 'income' ? delIncome.mutate(row.id) : delExpense.mutate(row.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {(tab === 'income' ? income : expenses).length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-sandalwood-400 text-sm">No entries yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Income Modal */}
      <Modal isOpen={modal === 'income'} onClose={() => setModal(null)} title="Add Income Entry">
        <form onSubmit={handleAddIncome} className="space-y-4">
          <div><label className="form-label">Source *</label>
            <input required value={incForm.source} onChange={si('source')} className="input-field" placeholder="Customer Orders, Catering, Bulk Order…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Amount (₹) *</label>
              <input required type="number" min="0" value={incForm.amount} onChange={si('amount')} className="input-field" />
            </div>
            <div><label className="form-label">Date</label>
              <input type="date" value={incForm.date} onChange={si('date')} className="input-field" />
            </div>
          </div>
          <div><label className="form-label">Notes</label>
            <textarea value={incForm.notes} onChange={si('notes')} rows={2} className="input-field resize-none" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="secondary" loading={saving} className="flex-1">Add Income</Button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={modal === 'expense'} onClose={() => setModal(null)} title="Add Expense Entry">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div><label className="form-label">Category *</label>
            <select value={expForm.category} onChange={se('category')} className="input-field">
              {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Amount (₹) *</label>
              <input required type="number" min="0" value={expForm.amount} onChange={se('amount')} className="input-field" />
            </div>
            <div><label className="form-label">Date</label>
              <input type="date" value={expForm.date} onChange={se('date')} className="input-field" />
            </div>
          </div>
          <div><label className="form-label">Notes</label>
            <textarea value={expForm.notes} onChange={se('notes')} rows={2} className="input-field resize-none" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">Add Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
