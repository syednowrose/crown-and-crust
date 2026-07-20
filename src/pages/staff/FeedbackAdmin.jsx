import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flag, Star, AlertTriangle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFeedback, flagFeedback } from '../../services/feedbackService'
import StarRating from '../../components/ui/StarRating'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function FeedbackAdmin() {
  const qc = useQueryClient()
  const [filterRating, setFilterRating] = useState(0)
  const [showFlagged, setShowFlagged] = useState(false)

  const { data: feedback = [], isLoading } = useQuery({ queryKey: ['feedback'], queryFn: getFeedback })

  const flagMutation = useMutation({
    mutationFn: ({ id, flag }) => flagFeedback(id, flag),
    onSuccess: () => { qc.invalidateQueries(['feedback']); toast.success('Feedback updated') },
  })

  const filtered = feedback.filter(f => {
    if (showFlagged && !f.is_flagged) return false
    if (filterRating && f.rating !== filterRating) return false
    return true
  })

  const avgRating = feedback.length
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : 0

  const ratingDist = [5,4,3,2,1].map(r => ({
    star: r,
    count: feedback.filter(f => f.rating === r).length,
    pct: feedback.length ? Math.round(feedback.filter(f => f.rating === r).length / feedback.length * 100) : 0,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-espresso-800">Customer Feedback</h1>
        <p className="text-sandalwood-500 text-sm mt-0.5">
          {feedback.length} reviews · Avg rating: {avgRating} ★
        </p>
      </div>

      {/* Rating summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="text-center">
            <p className="font-serif text-5xl text-espresso-800 font-semibold">{avgRating}</p>
            <StarRating value={Math.round(Number(avgRating))} readOnly size={20} />
            <p className="text-xs text-sandalwood-400 mt-1">{feedback.length} reviews</p>
          </div>
          <div className="flex-1 space-y-2">
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-sandalwood-500 w-4">{star}</span>
                <Star size={12} className="fill-gold-400 text-gold-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-sandalwood-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="h-full bg-gold-400 rounded-full"
                  />
                </div>
                <span className="text-xs text-sandalwood-500 w-7">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-serif text-lg text-espresso-800 mb-4">Filters</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-sandalwood-600 mb-2">Filter by rating</p>
              <div className="flex gap-2">
                <button onClick={() => setFilterRating(0)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!filterRating ? 'bg-espresso-800 text-white' : 'bg-sandalwood-100 text-espresso-700 hover:bg-sandalwood-200'}`}>
                  All
                </button>
                {[5,4,3,2,1].map(r => (
                  <button key={r} onClick={() => setFilterRating(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filterRating === r ? 'bg-espresso-800 text-white' : 'bg-sandalwood-100 text-espresso-700 hover:bg-sandalwood-200'}`}>
                    {r}★
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showFlagged} onChange={e => setShowFlagged(e.target.checked)}
                className="w-4 h-4 rounded accent-red-500" />
              <span className="text-sm text-espresso-700">Show flagged only</span>
            </label>
            {feedback.filter(f => f.rating <= 2).length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle size={16} className="text-red-500" />
                <p className="text-xs text-red-600">{feedback.filter(f => f.rating <= 2).length} low-rating review(s) need attention</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback list */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Star size={48} className="text-sandalwood-200 mx-auto mb-3" />
          <p className="text-sandalwood-400">No feedback matches your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((fb, i) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card p-5 ${fb.is_flagged ? 'border-red-200 bg-red-50/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-sandalwood-gradient flex items-center justify-center text-espresso-700 font-semibold text-sm">
                      {fb.customers?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-espresso-800">{fb.customers?.name || 'Customer'}</p>
                      <p className="text-xs text-sandalwood-400">{format(new Date(fb.created_at), 'dd MMM yyyy')}</p>
                    </div>
                    <StarRating value={fb.rating} readOnly size={16} />
                    {fb.rating <= 2 && (
                      <span className="badge-danger text-xs">Low Rating</span>
                    )}
                    {fb.is_flagged && (
                      <span className="badge-danger text-xs">🚩 Flagged</span>
                    )}
                  </div>
                  {fb.foods?.name && (
                    <p className="text-xs text-sandalwood-400 mb-1">Re: <span className="text-sandalwood-600 font-medium">{fb.foods.name}</span></p>
                  )}
                  <p className="text-sm text-espresso-700">{fb.comment || '(No comment)'}</p>
                </div>
                <button
                  onClick={() => flagMutation.mutate({ id: fb.id, flag: !fb.is_flagged })}
                  className={`p-2 rounded-lg transition-colors ${fb.is_flagged ? 'bg-red-100 text-red-500 hover:bg-red-200' : 'hover:bg-sandalwood-100 text-sandalwood-400 hover:text-red-400'}`}
                  title={fb.is_flagged ? 'Unflag' : 'Flag'}
                >
                  <Flag size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
