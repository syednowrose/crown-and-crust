import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, User, Truck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, updateOrderStatus, assignDeliveryPartner } from '../../services/orderService'
import { getEmployees } from '../../services/employeeService'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ORDER_STATUSES = ['placed','preparing','out_for_delivery','delivered','cancelled']

const statusConfig = {
  placed:           { color: 'bg-blue-100 text-blue-700',    label: 'Placed',            next: 'preparing'        },
  preparing:        { color: 'bg-amber-100 text-amber-700',  label: 'Preparing',          next: 'out_for_delivery' },
  out_for_delivery: { color: 'bg-purple-100 text-purple-700',label: 'Out for Delivery',   next: 'delivered'        },
  delivered:        { color: 'bg-emerald-100 text-emerald-700',label: 'Delivered',         next: null               },
  cancelled:        { color: 'bg-red-100 text-red-700',      label: 'Cancelled',           next: null               },
}

export default function Orders() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [assignModal, setAssignModal] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders', statusFilter], queryFn: () => getOrders({ status: statusFilter || undefined }) })
  const { data: employees = [] } = useQuery({ queryKey: ['employees'], queryFn: getEmployees })
  const deliveryPartners = employees.filter(e => e.role === 'Delivery')

  const filtered = orders.filter(o =>
    !search || o.id.includes(search) || o.customers?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['orders']); toast.success('Status updated') },
    onError: (e) => toast.error(e.message),
  })

  const assignMutation = useMutation({
    mutationFn: ({ orderId, partnerId }) => assignDeliveryPartner(orderId, partnerId),
    onSuccess: () => { qc.invalidateQueries(['orders']); toast.success('Delivery partner assigned'); setAssignModal(null) },
    onError: (e) => toast.error(e.message),
  })

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-espresso-800">Orders</h1>
          <p className="text-sandalwood-500 text-sm mt-0.5">{orders.length} total · ₹{totalRevenue.toLocaleString()} delivered revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sandalwood-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or customer…" className="input-field pl-9 w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!statusFilter ? 'bg-espresso-800 text-white' : 'bg-sandalwood-100 text-espresso-700 hover:bg-sandalwood-200'}`}>
            All
          </button>
          {ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === s ? 'bg-espresso-800 text-white' : 'bg-sandalwood-100 text-espresso-700 hover:bg-sandalwood-200'}`}>
              {s.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Status count badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ORDER_STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length
          const cfg = statusConfig[s]
          return (
            <div key={s} className="glass-card p-3 text-center">
              <p className="font-serif text-xl text-espresso-800">{count}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
          )
        })}
      </div>

      {/* Orders table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-sandalwood-50 border-b border-sandalwood-200">
                {['Order ID','Customer','Items','Total','Payment','Status','Date','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-sandalwood-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const cfg = statusConfig[order.status]
                const items = Array.isArray(order.items) ? order.items : []
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.02 }}
                    className="border-b border-sandalwood-100 hover:bg-sandalwood-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-sandalwood-500">#{order.id.slice(0,8)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-espresso-800">{order.customers?.name || 'Customer'}</p>
                        <p className="text-xs text-sandalwood-400">{order.customers?.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-sandalwood-600">{items.length} item(s)</td>
                    <td className="px-4 py-3 text-sm font-semibold text-espresso-800">₹{Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {order.payment_status} / {order.payment_method?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-sandalwood-500 whitespace-nowrap">
                      {format(new Date(order.order_date), 'dd MMM, HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {cfg.next && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => statusMutation.mutate({ id: order.id, status: cfg.next })}
                            className="text-xs px-2 py-1 whitespace-nowrap"
                          >
                            → {statusConfig[cfg.next]?.label}
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <button onClick={() => setAssignModal(order)}
                            className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors" title="Assign delivery">
                            <Truck size={14} />
                          </button>
                        )}
                        <button onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg hover:bg-sandalwood-100 text-espresso-600 transition-colors" title="View details">
                          <User size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-sandalwood-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order #${selectedOrder?.id?.slice(0,8)}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-sandalwood-500">Customer</p><p className="font-medium text-espresso-800">{selectedOrder.customers?.name}</p></div>
              <div><p className="text-xs text-sandalwood-500">Phone</p><p className="font-medium text-espresso-800">{selectedOrder.customers?.phone}</p></div>
              <div><p className="text-xs text-sandalwood-500">Address</p><p className="font-medium text-espresso-800 text-sm">{selectedOrder.delivery_address || selectedOrder.customers?.address || '—'}</p></div>
              <div><p className="text-xs text-sandalwood-500">Order Date</p><p className="font-medium text-espresso-800">{format(new Date(selectedOrder.order_date), 'dd MMM yyyy, HH:mm')}</p></div>
            </div>
            <div>
              <p className="text-xs text-sandalwood-500 mb-2">Items</p>
              {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-sandalwood-100 text-sm">
                  <span className="text-espresso-700">{item.name} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-semibold">
                <span>Total</span><span>₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-sandalwood-500">Payment</p>
                <span className={`text-sm font-medium ${selectedOrder.payment_status === 'paid' ? 'text-emerald-600':'text-amber-600'}`}>
                  {selectedOrder.payment_status} ({selectedOrder.payment_method})
                </span>
              </div>
              <div><p className="text-xs text-sandalwood-500">Delivery Partner</p>
                <p className="font-medium text-espresso-800 text-sm">{selectedOrder.employees?.name || 'Not assigned'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Delivery Modal */}
      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Delivery Partner">
        <div className="space-y-3">
          <p className="text-sm text-sandalwood-500">Select a delivery partner for order #{assignModal?.id?.slice(0,8)}</p>
          {deliveryPartners.length === 0 && <p className="text-sandalwood-400 text-sm">No delivery employees found. Add some in Employee Management.</p>}
          {deliveryPartners.map(p => (
            <button
              key={p.id}
              onClick={() => assignMutation.mutate({ orderId: assignModal.id, partnerId: p.id })}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-sandalwood-200 hover:border-sandalwood-400 hover:bg-sandalwood-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">{p.name[0]}</div>
              <div className="text-left">
                <p className="font-medium text-espresso-800">{p.name}</p>
                <p className="text-xs text-sandalwood-400">{p.phone}</p>
              </div>
              <Truck size={16} className="ml-auto text-purple-500" />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
