/**
 * HireTalentFlow.jsx
 * Owns form state, validation, and API submit.
 * Single step — no more multi-step orchestration needed.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../api/auth';
import HireTalentForm from './HireTalentForm';

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ form }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', padding: '40px 16px' }}
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#fef3c7', fontSize: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >✦</motion.div>

      <h2 style={{
        fontSize: '24px', fontWeight: 900, color: '#1c1917',
        margin: '0 0 10px', letterSpacing: '-0.02em',
      }}>
        Brief received
      </h2>
      <p style={{ fontSize: '14px', color: '#78716c', margin: '0 0 24px', lineHeight: 1.6 }}>
        Thanks, <strong style={{ color: '#1c1917' }}>{form.company_name}</strong>.
        We'll review your brief and reach out to{' '}
        <strong style={{ color: '#1c1917' }}>{form.email}</strong> within{' '}
        <strong style={{ color: '#d97706' }}>24 hours</strong>.
      </p>

      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: '14px', padding: '16px 20px', textAlign: 'left',
        maxWidth: '360px', margin: '0 auto',
      }}>
        {[
          { label: 'Company',     value: form.company_name },
          { label: 'Role',        value: form.role },
          { label: 'Job Type',    value: form.job_type },
          { label: 'Skill Level', value: form.skill_level },
          { label: 'Budget',      value: form.budget || 'To be discussed' },
        ].map((row, i, arr) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', marginBottom: i < arr.length - 1 ? '8px' : 0,
          }}>
            <span style={{ color: '#78716c' }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: '#1c1917' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main orchestrator ─────────────────────────────────────────────────────────
export default function HireTalentFlow() {
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState({});

  const [form, setForm] = useState({
    company_name: '',
    email:        '',
    industry:     '',
    phone:        '',
    role:         '',
    job_type:     '',
    skill_level:  '',
    budget:       '',
    description:  '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.company_name.trim())  e.company_name = 'Company name is required';
    if (!form.email.trim())         e.email        = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                    e.email        = 'Enter a valid email address';
    if (!form.industry)             e.industry     = 'Please select an industry';
    if (!form.role)                 e.role         = 'Please select a role';
    if (!form.job_type)             e.job_type     = 'Please select a job type';
    if (!form.skill_level)          e.skill_level  = 'Please select a skill level';
    if (!form.description.trim())   e.description  = 'Please describe the role';
    return e;
  };

  // ── Submit → POST /api/hire/ ──────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);

    try {
      await api.post('/hire/', form);
      setSubmitted(true);
    } catch (err) {
      const data = err?.response?.data;
      const msg  =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        (data && Object.values(data)?.[0]?.[0]) ||
        'Something went wrong. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SuccessScreen form={form} />;

  return (
    <HireTalentForm
      form={form}
      errors={errors}
      updateField={updateField}
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}