import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, addSalaryPayment, getSalaryHistory } from '../../services/employeeService'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ROLES = ['Baker','Cashier','Delivery','Manager','Admin']

const roleColors = {
  Baker: 'bg-amber-100 text-amber-700',
  Cashier: 'bg-blue-100 text-blue-700',
  Delivery: 'bg-purple-100 text-purple-700',
  Manager: 'bg-emerald-100 text-emerald-700',
  Admin: 'bg-espresso-100 text-espresso-700',
}

const defaultEmp = { name:'', role:'Baker', email:'', phone:'', salary:'', joining_date: new Date().toISOString().split('T')[0], notes:'' }

export default function EmployeeManagement() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(defaultEmp)
  const [salaryModal, setSalaryModal] = useState(null)
  const [salaryHistory, setSalaryHistory] = useState([])
  const [salaryForm, setSalaryForm] = useState({ amount:'', month: new Date().getMonth()+1, year: new Date().getFullYear(), notes:'' })
  const [saving, setSaving] = useState(false)

  const { data: employees = [], isLoading } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => { qc.invalidateQueries(['employees']); toast.success('Employee removed') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  )

  const totalSalary = employees.reduce((s, e) => s + Number(e.salary), 0)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setSal = (k) => (e) => setSalaryForm(f => ({ ...f, [k]: e.target.value }))

  const openAdd = () => { setForm(defaultEmp); setSelected(null); setModal('add') }
  const openEdit = (emp) => { setForm({ ...emp }); setSelected(emp); setModal('edit') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'add') {
        await createEmployee({ ...form, salary: Number(form.salary) })
        toast.success('Employee added!')
      } else {
        await updateEmployee(selected.id, { ...form, salary: Number(form.salary) })
        toast.success('Employee updated!')
      }
      qc.invalidateQueries(['employees'])
      setModal(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openSalary = async (emp) => {
    setSelected(emp)
    setSalaryForm({ amount: emp.salary, month: new Date().getMonth()+1, year: new Date().getFullYear(), notes: '' })
    const hist = await getSalaryHistory(emp.id)
    setSalaryHistory(hist)
    setSalaryModal(true)
  }

  const handleSalaryPay = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addSalaryPayment({ employee_id: selected.id, ...salaryForm, amount: Number(salaryForm.amount) })
      await updateEmployee(selected.id, { payment_status: 'paid' })
      qc.invalidateQueries(['employees'])
      const hist = await getSalaryHistory(selected.id)
      setSalaryHistory(hist)
      toast.success('Salary payment recorded!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-espresso-800">Employees</h1>
          <p className="text-sandalwood-500 text-sm mt-0.5">{employees.length} team members · Monthly payout: ₹{totalSalary.toLocaleString()}</p>
        </div>
        <Button onClick={openAdd} variant="primary" className="flex items-center gap-2">
          <Plus size={18} /> Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…" className="input-field pl-9 w-full" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ROLES.map(role => {
          const count = employees.filter(e => e.role === role).length
          return (
            <div key={role} className="glass-card p-4 text-center">
              <p className="font-serif text-2xl text-espresso-800">{count}</p>
              <p className="text-xs text-sandalwood-500 mt-1">{role}s</p>
            </div>
          )
        })}
      </div>

      {/* Employee table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={48} className="text-sandalwood-300 mx-auto mb-3" />
          <p className="text-sandalwood-400">No employees found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-sandalwood-50 border-b border-sandalwood-200">
                  {['Name','Role','Contact','Salary','Status','Joined','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sandalwood-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((emp, i) => (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-sandalwood-100 hover:bg-sandalwood-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sandalwood-gradient flex items-center justify-center text-espresso-700 font-semibold text-sm flex-shrink-0">
                            {emp.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-espresso-800 text-sm">{emp.name}</p>
                            <p className="text-xs text-sandalwood-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[emp.role] || 'badge-neutral'}`}>{emp.role}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-espresso-700">{emp.phone}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-espresso-800">₹{Number(emp.salary).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={emp.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}>
                          {emp.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-sandalwood-500">{format(new Date(emp.joining_date), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-sandalwood-100 text-espresso-600 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => openSalary(emp)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
                            <DollarSign size={14} />
                          </button>
                          <button onClick={() => deleteMutation.mutate(emp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Employee' : 'Edit Employee'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input required value={form.name} onChange={set('name')} className="input-field" placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="form-label">Role *</label>
              <select value={form.role} onChange={set('role')} className="input-field">
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone *</label>
              <input required value={form.phone} onChange={set('phone')} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className="input-field" placeholder="priya@email.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Monthly Salary (₹) *</label>
              <input required type="number" min="0" value={form.salary} onChange={set('salary')} className="input-field" placeholder="25000" />
            </div>
            <div>
              <label className="form-label">Joining Date</label>
              <input type="date" value={form.joining_date} onChange={set('joining_date')} className="input-field" />
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} className="input-field resize-none" placeholder="Any additional info…" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">
              {modal === 'add' ? 'Add Employee' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Salary Modal */}
      <Modal isOpen={!!salaryModal} onClose={() => setSalaryModal(null)} title={`Salary — ${selected?.name}`} size="lg">
        <div className="space-y-6">
          <form onSubmit={handleSalaryPay} className="space-y-4">
            <h3 className="font-medium text-espresso-800">Record Salary Payment</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="form-label">Amount (₹)</label>
                <input type="number" required value={salaryForm.amount} onChange={setSal('amount')} className="input-field" />
              </div>
              <div>
                <label className="form-label">Month</label>
                <select value={salaryForm.month} onChange={setSal('month')} className="input-field">
                  {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Year</label>
                <input type="number" value={salaryForm.year} onChange={setSal('year')} className="input-field" />
              </div>
            </div>
            <div>
              <label className="form-label">Notes</label>
              <input value={salaryForm.notes} onChange={setSal('notes')} className="input-field" placeholder="Bonus, deduction, etc." />
            </div>
            <Button type="submit" variant="primary" loading={saving} className="w-full">Mark as Paid</Button>
          </form>

          {/* Payment history */}
          <div>
            <h3 className="font-medium text-espresso-800 mb-3">Payment History</h3>
            {salaryHistory.length === 0 ? (
              <p className="text-sandalwood-400 text-sm text-center py-4">No payment records yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {salaryHistory.map(sh => (
                  <div key={sh.id} className="flex items-center justify-between py-2 border-b border-sandalwood-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-sandalwood-400" />
                      <span className="text-sm text-espresso-700">{MONTHS[sh.month-1]} {sh.year}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">₹{Number(sh.amount).toLocaleString()}</p>
                      <p className="text-xs text-sandalwood-400">{format(new Date(sh.paid_at), 'dd MMM')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
