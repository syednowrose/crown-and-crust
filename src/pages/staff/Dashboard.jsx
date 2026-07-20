import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, UtensilsCrossed, ShoppingBag, Star, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getFoods } from '../../services/foodService'
import { getEmployees } from '../../services/employeeService'
import { getFinanceSummary, getMonthlyChartData } from '../../services/financeService'
import { getOrders, getActiveOrdersCount } from '../../services/orderService'
import { getTopFeedback } from '../../services/feedbackService'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import StarRating from '../../components/ui/StarRating'

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function StatCard({ title, value, icon: Icon, color, prefix = '', suffix = '', delay = 0 }) {
  const animated = useCounter(typeof value === 'number' ? value : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(194,161,119,0.22)' }}
      className="glass-card p-6 cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <p className="text-sandalwood-500 text-sm font-medium mb-1">{title}</p>
      <p className="font-serif text-3xl text-espresso-800 font-semibold">
        {prefix}{typeof value === 'number' ? animated.toLocaleString() : value}{suffix}
      </p>
    </motion.div>
  )
}

const statusColors = {
  placed:           'bg-blue-100 text-blue-700',
  preparing:        'bg-amber-100 text-amber-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered:        'bg-emerald-100 text-emerald-700',
  cancelled:        'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const { staffProfile } = useAuth()
  const [period, setPeriod] = useState('monthly')

  const { data: foods = [] }     = useQuery({ queryKey: ['foods'], queryFn: getFoods })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })
  const { data: finance }        = useQuery({ queryKey: ['finance', period], queryFn: () => getFinanceSummary(period) })
  const { data: orders = [] }    = useQuery({ queryKey: ['orders'], queryFn: () => getOrders() })
  const { data: chartData = [] } = useQuery({ queryKey: ['chart'], queryFn: getMonthlyChartData })
  const { data: topFeedback = [] } = useQuery({ queryKey: ['topFeedback'], queryFn: () => getTopFeedback(4) })

  const inStock    = foods.filter(f => f.stock_status === 'in_stock').length
  const outOfStock = foods.filter(f => f.stock_status === 'out_of_stock').length
  const activeOrds = orders.filter(o => ['placed','preparing','out_for_delivery'].includes(o.status)).length
  const monthlySalary = employees.reduce((s, e) => s + Number(e.salary), 0)

  const avgRating = topFeedback.length
    ? (topFeedback.reduce((s, f) => s + f.rating, 0) / topFeedback.length).toFixed(1)
    : '—'

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-serif text-3xl text-espresso-800">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span className="text-sandalwood-600">{staffProfile?.name?.split(' ')[0] || 'there'}</span> 👋
        </h1>
        <p className="text-sandalwood-500 mt-1">Here's what's happening at Crown & Crust today.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Menu Items"      value={foods.length}                     icon={UtensilsCrossed} color="bg-sandalwood-500"  delay={0}   />
        <StatCard title="Employees"       value={employees.length}                  icon={Users}           color="bg-espresso-700"    delay={0.08} />
        <StatCard title="Active Orders"   value={activeOrds}                        icon={ShoppingBag}     color="bg-amber-500"       delay={0.16} />
        <StatCard title="Net Profit"      value={Math.abs(finance?.netProfit || 0)} icon={TrendingUp}      color="bg-emerald-600"     delay={0.24}
          prefix={finance?.netProfit >= 0 ? '₹' : '-₹'}
        />
      </div>

      {/* Finance summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Total Income',  value: finance?.totalIncome,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Total Expense', value: finance?.totalExpense, color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200'     },
          { label: 'Monthly Salary Payout', value: monthlySalary, color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200'   },
        ].map(({ label, value, color, bg, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={`${bg} border ${border} rounded-2xl p-5`}
          >
            <p className="text-sm text-espresso-600 mb-1">{label}</p>
            <p className={`font-serif text-2xl font-semibold ${color}`}>
              ₹{(value || 0).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-espresso-800">Financial Overview</h2>
          <div className="flex gap-2">
            {['weekly','monthly','yearly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  period === p ? 'bg-espresso-800 text-white' : 'bg-sandalwood-100 text-espresso-600 hover:bg-sandalwood-200'
                }`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eed9c0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9a7050' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9a7050' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2c09a', background: '#fdf8f3' }}
              formatter={(v) => [`₹${v.toLocaleString()}`, undefined]}
            />
            <Legend />
            <Area type="monotone" dataKey="income"  stroke="#16a34a" fill="url(#incGrad)" strokeWidth={2} name="Income"  />
            <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="url(#expGrad)" strokeWidth={2} name="Expense" />
            <Area type="monotone" dataKey="profit"  stroke="#C2A177" fill="none"           strokeWidth={2} name="Profit" strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row: Recent orders + feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="glass-card p-6">
          <h2 className="font-serif text-xl text-espresso-800 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-sandalwood-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-espresso-800">#{order.id.slice(0,8)}</p>
                  <p className="text-xs text-sandalwood-500">{new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-espresso-700 text-sm">₹{order.total_amount}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'badge-neutral'}`}>
                    {order.status?.replace(/_/g,' ')}
                  </span>
                </div>
              </div>
            ))}
            {!orders.length && <p className="text-sandalwood-400 text-sm text-center py-4">No orders yet</p>}
          </div>
        </div>

        {/* Top feedback */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-espresso-800">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <Star size={16} className="fill-gold-400 text-gold-400" />
              <span className="font-semibold text-espresso-700">{avgRating}</span>
            </div>
          </div>
          <div className="space-y-4">
            {topFeedback.map(fb => (
              <div key={fb.id} className="border-b border-sandalwood-100 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-espresso-800">{fb.customers?.name || 'Customer'}</p>
                  <StarRating value={fb.rating} readOnly size={14} />
                </div>
                <p className="text-xs text-sandalwood-500 line-clamp-2">{fb.comment || 'Great experience!'}</p>
                <p className="text-xs text-sandalwood-400 mt-1">{fb.foods?.name}</p>
              </div>
            ))}
            {!topFeedback.length && (
              <div className="text-center py-4">
                <AlertTriangle size={32} className="text-sandalwood-300 mx-auto mb-2" />
                <p className="text-sandalwood-400 text-sm">No feedback yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock summary */}
      <div className="glass-card p-6">
        <h2 className="font-serif text-xl text-espresso-800 mb-4">Stock Overview</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-espresso-700">In Stock: <strong>{inStock}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-espresso-700">Out of Stock: <strong>{outOfStock}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm text-espresso-700">Limited: <strong>{foods.filter(f => f.stock_status === 'limited').length}</strong></span>
          </div>
        </div>
        <div className="mt-4 h-3 rounded-full bg-sandalwood-100 overflow-hidden flex">
          <div style={{ width: `${foods.length ? (inStock/foods.length)*100 : 0}%` }} className="bg-emerald-500 transition-all duration-700" />
          <div style={{ width: `${foods.length ? (foods.filter(f=>f.stock_status==='limited').length/foods.length)*100 : 0}%` }} className="bg-amber-500 transition-all duration-700" />
          <div style={{ width: `${foods.length ? (outOfStock/foods.length)*100 : 0}%` }} className="bg-red-500 transition-all duration-700" />
        </div>
      </div>
    </div>
  )
}
