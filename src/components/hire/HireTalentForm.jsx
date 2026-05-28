/**
 * HireTalentForm.jsx
 * Pure UI — all fields, dropdowns, and submit button.
 * Stateless: values + handlers come from HireTalentFlow.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const amber      = '#d97706';
const amberDeep  = '#b45309';
const amberLight = '#fef3c7';
const stone900   = '#1c1917';
const stone600   = '#78716c';
const stone400   = '#a8a29e';
const stone50    = '#fafaf9';

// ── Options ───────────────────────────────────────────────────────────────────
export const INDUSTRIES = [
  'Tech & Software', 'Finance & Fintech', 'E-commerce', 'Healthcare',
  'Media & Creative', 'Education', 'Legal', 'Real Estate',
  'NGO / Non-profit', 'Other',
];

export const ROLES = [
  'Executive Virtual Assistant',
  'Administrative VA',
  'Social Media VA',
  'Research & Reporting VA',
  'Customer Support VA',
  'Bookkeeping & Finance VA',
  'Content Writing VA',
  'CRM & Lead Generation VA',
  'Project Management VA',
  'Travel & Logistics VA',
  'Other',
];

export const JOB_TYPES = [
  'Fully Remote',
  'Hybrid',
  'On-site',
];

export const SKILL_LEVELS = [
  'Entry (0–2 yrs)',
  'Intermediate (2–5 yrs)',
  'Expert (5+ yrs)',
];

export const BUDGETS = [
  'Under $500 / mo',
  '$500 – $1,000 / mo',
  '$1,000 – $2,000 / mo',
  '$2,000+ / mo',
  'Open to discussion',
];

// ── Primitives ────────────────────────────────────────────────────────────────
function inputStyle(focused, hasError) {
  return {
    width: '100%', padding: '10px 13px',
    fontSize: '13px', color: stone900,
    background: focused ? '#fffbeb' : stone50,
    border: `1.5px solid ${hasError ? '#dc2626' : focused ? amber : '#e7e5e4'}`,
    borderRadius: '10px', outline: 'none',
    transition: 'all 0.18s ease',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };
}

function selectStyle(focused, hasError) {
  return {
    ...inputStyle(focused, hasError),
    appearance: 'none',
    WebkitAppearance: 'none',
    paddingRight: '36px',
    cursor: 'pointer',
  };
}

function Field({ label, error, hint, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{
        fontSize: '10px', fontWeight: 800, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: stone600,
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        {label}
        {required && <span style={{ color: amber }}>*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: '11px', color: '#dc2626', margin: 0 }}
          >{error}</motion.p>
        )}
        {hint && !error && (
          <p style={{ fontSize: '11px', color: stone400, margin: 0 }}>{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Chevron for select fields
function Chevron() {
  return (
    <div style={{
      position: 'absolute', right: '12px', top: '50%',
      transform: 'translateY(-50%)', pointerEvents: 'none', color: stone400,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

// ── Main form UI ──────────────────────────────────────────────────────────────
export default function HireTalentForm({
  form, errors, updateField, submitting, onSubmit,
}) {
  const [focused, setFocused] = useState('');

  const fi = (field) => ({
    value: form[field],
    onChange: (e) => updateField(field, e.target.value),
    onFocus: () => setFocused(field),
    onBlur: () => setFocused(''),
  });

  const selectProps = (field, hasError) => ({
    ...fi(field),
    style: selectStyle(focused === field, hasError),
  });

  const inputProps = (field, hasError) => ({
    ...fi(field),
    style: inputStyle(focused === field, hasError),
  });

  return (
    <div style={{
      background: '#fff', borderRadius: '20px',
      border: '1.5px solid #f0efee', padding: '24px',
      boxShadow: '0 6px 28px rgba(0,0,0,0.07)',
    }}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Row 1 — Company name + email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Company Name" error={errors.company_name} required>
            <input
              type="text" placeholder="Acme Corp"
              autoComplete="organization"
              {...inputProps('company_name', !!errors.company_name)}
            />
          </Field>
          <Field label="Company Email" error={errors.email} required>
            <input
              type="email" placeholder="hello@acme.co"
              autoComplete="email"
              {...inputProps('email', !!errors.email)}
            />
          </Field>
        </div>

        {/* Row 2 — Industry + Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Industry" error={errors.industry} required>
            <div style={{ position: 'relative' }}>
              <select {...selectProps('industry', !!errors.industry)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <Chevron />
            </div>
          </Field>
          <Field label="Phone" hint="WhatsApp preferred">
            <input
              type="tel" placeholder="+254 7XX XXX XXX"
              autoComplete="tel"
              {...inputProps('phone', false)}
            />
          </Field>
        </div>

        {/* Row 3 — Role + Job type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Role Needed" error={errors.role} required>
            <div style={{ position: 'relative' }}>
              <select {...selectProps('role', !!errors.role)}>
                <option value="">Select a role</option>
                {ROLES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <Chevron />
            </div>
          </Field>
          <Field label="Job Type" error={errors.job_type} required>
            <div style={{ position: 'relative' }}>
              <select {...selectProps('job_type', !!errors.job_type)}>
                <option value="">Select type</option>
                {JOB_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <Chevron />
            </div>
          </Field>
        </div>

        {/* Row 4 — Skill level + Budget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Skill Level" error={errors.skill_level} required>
            <div style={{ position: 'relative' }}>
              <select {...selectProps('skill_level', !!errors.skill_level)}>
                <option value="">Select level</option>
                {SKILL_LEVELS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <Chevron />
            </div>
          </Field>
          <Field label="Budget" hint="Monthly estimate">
            <div style={{ position: 'relative' }}>
              <select {...selectProps('budget', false)}>
                <option value="">Select budget</option>
                {BUDGETS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <Chevron />
            </div>
          </Field>
        </div>

        {/* Role description */}
        <Field
          label="Role Description" error={errors.description} required
          hint="Key responsibilities, tools, working hours"
        >
          <textarea
            rows={4}
            placeholder="e.g. Manage executive inbox, schedule meetings across time zones, prepare weekly reports in Notion…"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            onFocus={() => setFocused('description')}
            onBlur={() => setFocused('')}
            style={{
              ...inputStyle(focused === 'description', !!errors.description),
              resize: 'vertical', minHeight: '100px', lineHeight: 1.6,
            }}
          />
        </Field>

        {/* Submit error */}
        <AnimatePresence>
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '10px 14px',
                fontSize: '12px', color: '#dc2626',
              }}
            >
              ⚠ {errors.submit}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          whileHover={!submitting ? { scale: 1.02 } : {}}
          whileTap={!submitting ? { scale: 0.97 } : {}}
          onClick={onSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '14px', fontFamily: 'inherit',
            background: submitting
              ? '#e7e5e4'
              : `linear-gradient(135deg, ${amber}, ${amberDeep})`,
            color: submitting ? stone400 : 'white',
            fontWeight: 800, fontSize: '14px',
            borderRadius: '11px', border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 5px 18px rgba(217,119,6,0.3)',
            transition: 'all 0.2s', letterSpacing: '0.01em',
          }}
        >
          {submitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  border: '2px solid #c4c0bc', borderTopColor: 'transparent',
                  borderRadius: '50%',
                }}
              />
              Submitting…
            </span>
          ) : 'Submit Hiring Brief →'}
        </motion.button>

      </div>

      {/* Trust strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '18px', marginTop: '16px',
      }}>
        {['🔒 Confidential', '⚡ 24hr response', '✦ Vetted talent only'].map(t => (
          <span key={t} style={{ fontSize: '10px', color: stone400, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}