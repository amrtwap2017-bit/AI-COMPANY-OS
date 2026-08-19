'use client'
import { useState, useEffect } from 'react'
import { tbFetch } from '@/lib/api/tb-client'

interface Contract {
  id: string
  title?: string
  status?: string
  contract_number?: string
  client_name?: string
  start_date?: string
  end_date?: string
  value?: number
  hotel_id?: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return

    const fetchContracts = async () => {
      try {
        const response = await tbFetch('/api/v1/contracts/?limit=100')
        if (response.error) {
          setError(response.error.message || 'Failed to load contracts')
        } else {
          setContracts(
            Array.isArray(response)
              ? response
              : response?.results ?? response?.data ?? []
          )
        }
      } catch (err) {
        setError('An error occurred while fetching contracts.')
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [mounted])

  if (loading) return (
    <div className="tb-canvas p-8">
      <div className="tb-shimmer tb-shimmer-title mb-4" />
      <div className="tb-shimmer tb-shimmer-block" />
    </div>
  )

  if (error) return (
    <div className="tb-canvas p-8">
      <div className="tb-alert tb-alert-danger">{error}</div>
    </div>
  )

  return (
    <div className="tb-canvas">
      <div className="tb-hero">
        <h1 className="tb-hero-title">Contracts</h1>
        <p className="tb-hero-description">
          Manage and track all active contracts
        </p>
      </div>
      <div className="p-6">
        {contracts.length === 0 ? (
          <div className="tb-empty">
            <div className="tb-empty-icon">📋</div>
            <div className="tb-empty-title">No contracts found</div>
            <div className="tb-empty-desc">
              Contracts will appear here once created.
            </div>
          </div>
        ) : (
          <div className="tb-table-wrap">
            <table className="tb-table">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <a
                        href={`/commercial/contracts/${c.id}`}
                        className="text-[var(--color-text-brand)] font-medium hover:underline"
                      >
                        {c.title || c.contract_number || c.id}
                      </a>
                    </td>
                    <td>{c.client_name || '—'}</td>
                    <td>
                      <span className={`tb-badge ${
                        c.status === 'active' ? 'tb-badge-success' :
                        c.status === 'expired' ? 'tb-badge-danger' :
                        c.status === 'pending' ? 'tb-badge-warning' :
                        'tb-badge-neutral'
                      }`}>
                        {c.status || 'unknown'}
                      </span>
                    </td>
                    <td>{c.start_date ? new Date(c.start_date).toLocaleDateString() : '—'}</td>
                    <td>{c.end_date ? new Date(c.end_date).toLocaleDateString() : '—'}</td>
                    <td>{c.value ? `$${c.value.toLocaleString()}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
