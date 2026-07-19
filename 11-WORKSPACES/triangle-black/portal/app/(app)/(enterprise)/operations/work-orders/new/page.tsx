// @ts-nocheck
'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronRight, ArrowLeft, Save, AlertCircle, Loader2,
  Wrench, AlertTriangle, Info,
} from 'lucide-react'
import { cn } from '@/components/shell/utils'
import { useCreateWorkOrder } from '@/lib/hooks'
import { createWorkOrderSchema, type CreateWorkOrderInput, WO_CATEGORIES, WO_PRIORITIES } from '@/lib/schemas/workOrder'

// ─── Form Field Components ────────────────────────────────────────────────

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium block mb-1.5" style={{ color:'var(--tb-text-primary)' }}>
      {children}
      {required && <span className="text-[var(--tb-danger)] ml-1" aria-hidden="true">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 mt-1 text-xs" style={{ color:'var(--tb-danger)' }} role="alert">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ background:'var(--tb-surface-elevated)', borderColor:'var(--tb-border)' }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color:'var(--tb-text-primary)' }}>{title}</h3>
        {description && <p className="text-xs mt-0.5" style={{ color:'var(--tb-text-tertiary)' }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

const inputClass = cn(
  'w-full px-3 rounded-lg border text-sm transition-colors',
  'focus-visible:outline-none focus-visible:border-[var(--tb-border-focus)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--tb-border-focus)]/20',
  'disabled:opacity-50 disabled:cursor-not-allowed',
)

const inputStyle = {
  background:  'var(--tb-surface-elevated)',
  borderColor: 'var(--tb-border)',
  color:       'var(--tb-text-primary)',
}

const inputErrorStyle = {
  ...inputStyle,
  borderColor: 'var(--tb-danger-border)',
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function CreateWorkOrderPage() {
  const router  = useRouter()
  const create  = useCreateWorkOrder()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateWorkOrderInput>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      priority:         'medium',
      category:         '',
      estimated_hours:  undefined,
    },
  })

  const selectedPriority = watch('priority')

  const onSubmit = async (data: CreateWorkOrderInput) => {
    try {
      const wo = await create.mutateAsync(data)
      router.push(`/operations/work-orders/${wo.id}`)
    } catch {
      // Error is shown via toast from the mutation
    }
  }

  const onCancel = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Leave anyway?')) return
    }
    router.back()
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0"
        style={{ background:'var(--tb-surface-elevated)', borderColor:'var(--tb-border)' }}>
        <nav className="mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs" style={{ color:'var(--tb-text-tertiary)' }}>
            <li><Link href="/operations" className="hover:underline">Operations</Link></li>
            <ChevronRight className="h-3 w-3" />
            <li><Link href="/operations/work-orders" className="hover:underline">Work Orders</Link></li>
            <ChevronRight className="h-3 w-3" />
            <li style={{ color:'var(--tb-text-primary)', fontWeight:500 }}>New Work Order</li>
          </ol>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-lg border shrink-0"
            style={{ borderColor:'var(--tb-border)', color:'var(--tb-text-tertiary)' }}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold" style={{ color:'var(--tb-text-primary)' }}>Create Work Order</h1>
            <p className="text-sm mt-0.5" style={{ color:'var(--tb-text-tertiary)' }}>
              All fields marked with * are required
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={onCancel}
              className="h-8 px-4 rounded-lg text-sm border"
              style={{ borderColor:'var(--tb-border)', color:'var(--tb-text-secondary)' }}>
              Cancel
            </button>
            <button
              type="submit"
              form="create-wo-form"
              disabled={isSubmitting || create.isPending}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-sm font-medium disabled:opacity-60"
              style={{ background:'var(--tb-brand-primary)', color:'var(--tb-text-on-brand)' }}>
              {(isSubmitting || create.isPending)
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                : <><Save className="h-3.5 w-3.5" /> Create Work Order</>}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <form id="create-wo-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Global error */}
            {create.error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background:'var(--tb-danger-bg)', borderColor:'var(--tb-danger-border)' }}>
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color:'var(--tb-danger-icon)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color:'var(--tb-danger)' }}>Failed to create work order</p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--tb-danger)' }}>
                    {create.error instanceof Error ? create.error.message : 'Please try again.'}
                  </p>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <FormSection title="Basic Information" description="Core details about this work order">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <FieldLabel htmlFor="title" required>Title</FieldLabel>
                  <input
                    id="title"
                    {...register('title')}
                    placeholder="e.g. HVAC Unit 3 — Cooling Failure"
                    className={cn(inputClass, 'h-10')}
                    style={errors.title ? inputErrorStyle : inputStyle}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                  />
                  <FieldError message={errors.title?.message} />
                </div>

                {/* Description */}
                <div>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    placeholder="Describe the issue in detail — what was observed, when it started, impact on operations..."
                    className={cn(inputClass, 'py-2 resize-y')}
                    style={errors.description ? inputErrorStyle : inputStyle}
                  />
                  <FieldError message={errors.description?.message} />
                  <p className="text-[10px] mt-1" style={{ color:'var(--tb-text-tertiary)' }}>
                    {watch('description')?.length ?? 0}/2000 characters
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Priority */}
            <FormSection title="Priority & Category" description="Set urgency and classify the work order">
              <div className="space-y-4">
                {/* Priority selector */}
                <div>
                  <FieldLabel htmlFor="priority" required>Priority</FieldLabel>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Priority">
                    {WO_PRIORITIES.map(p => {
                      const isSelected = selectedPriority === p.value
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setValue('priority', p.value as any, { shouldValidate:true })}
                          role="radio"
                          aria-checked={isSelected}
                          className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
                          style={{
                            background:  isSelected ? 'var(--tb-brand-primary)' : 'var(--tb-surface-elevated)',
                            borderColor: isSelected ? 'var(--tb-brand-primary)' : 'var(--tb-border)',
                            color:       isSelected ? 'var(--tb-text-on-brand)'  : 'var(--tb-text-primary)',
                          }}>
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            style={{ background: isSelected ? 'white' : p.color }} />
                          <div>
                            <p className="text-xs font-semibold capitalize">{p.value}</p>
                            <p className="text-[10px] mt-0.5 opacity-80 leading-tight">{p.label.split(' — ')[1]}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <FieldError message={errors.priority?.message} />
                </div>

                {/* Category */}
                <div>
                  <FieldLabel htmlFor="category" required>Category</FieldLabel>
                  <select
                    id="category"
                    {...register('category')}
                    className={cn(inputClass, 'h-10')}
                    style={errors.category ? inputErrorStyle : inputStyle}
                    aria-invalid={!!errors.category}>
                    <option value="">Select a category...</option>
                    {WO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <FieldError message={errors.category?.message} />
                </div>
              </div>
            </FormSection>

            {/* Location */}
            <FormSection title="Location & Asset" description="Where is this work required?">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="location" required>Location</FieldLabel>
                  <input
                    id="location"
                    {...register('location')}
                    placeholder="e.g. Tower A — Floor 12 — Room 1204"
                    className={cn(inputClass, 'h-10')}
                    style={errors.location ? inputErrorStyle : inputStyle}
                    aria-invalid={!!errors.location}
                  />
                  <FieldError message={errors.location?.message} />
                </div>
                <div>
                  <FieldLabel htmlFor="asset_id">Asset ID</FieldLabel>
                  <input
                    id="asset_id"
                    {...register('asset_id')}
                    placeholder="e.g. HVAC-03"
                    className={cn(inputClass, 'h-10')}
                    style={inputStyle}
                  />
                  <p className="text-[10px] mt-1" style={{ color:'var(--tb-text-tertiary)' }}>
                    Optional — link to a specific asset in the system
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Scheduling */}
            <FormSection title="Scheduling" description="Set deadlines and time estimates">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                  <input
                    id="due_date"
                    type="datetime-local"
                    {...register('due_date')}
                    min={new Date().toISOString().slice(0,16)}
                    className={cn(inputClass, 'h-10')}
                    style={errors.due_date ? inputErrorStyle : inputStyle}
                    aria-invalid={!!errors.due_date}
                  />
                  <FieldError message={errors.due_date?.message} />
                </div>
                <div>
                  <FieldLabel htmlFor="estimated_hours">Estimated Hours</FieldLabel>
                  <input
                    id="estimated_hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="999"
                    {...register('estimated_hours', { valueAsNumber:true })}
                    placeholder="e.g. 2.5"
                    className={cn(inputClass, 'h-10')}
                    style={errors.estimated_hours ? inputErrorStyle : inputStyle}
                    aria-invalid={!!errors.estimated_hours}
                  />
                  <FieldError message={errors.estimated_hours?.message} />
                </div>
              </div>
            </FormSection>

            {/* Summary */}
            <div className="rounded-xl border p-4"
              style={{ background:'var(--tb-info-bg)', borderColor:'var(--tb-info-border)' }}>
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color:'var(--tb-info-icon)' }} />
                <div className="text-xs" style={{ color:'var(--tb-info)' }}>
                  <p className="font-semibold mb-1">After creating this work order:</p>
                  <ul className="space-y-0.5 list-disc list-inside opacity-90">
                    <li>It will appear in the Work Orders list with status "Open"</li>
                    <li>SLA timer starts immediately based on priority</li>
                    <li>You can assign a technician from the Dispatch Center</li>
                    <li>Notifications will be sent to relevant team members</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit (bottom) */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-8">
              <button type="button" onClick={onCancel}
                className="h-9 px-5 rounded-lg text-sm border"
                style={{ borderColor:'var(--tb-border)', color:'var(--tb-text-secondary)' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || create.isPending}
                className="flex items-center gap-1.5 h-9 px-6 rounded-lg text-sm font-semibold disabled:opacity-60"
                style={{ background:'var(--tb-brand-primary)', color:'var(--tb-text-on-brand)' }}>
                {(isSubmitting || create.isPending)
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Work Order...</>
                  : <><Save className="h-4 w-4" /> Create Work Order</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
