import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

const Section = ({ icon, title, children, accent = '#10b981' }) => (
    <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h2>
        </div>
        {children}
    </div>
)

const Tag = ({ label, color = '#e8f5e9', textColor = '#2e7d32' }) => (
    <span style={{ background: color, color: textColor, borderRadius: 20, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 600, display: 'inline-block', margin: '2px 4px 2px 0' }}>
        {label}
    </span>
)

const Field = ({ label, value }) => (
    <div style={{ marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
        <div style={{ fontSize: '0.92rem', color: '#1f2937', marginTop: 2 }}>{value || <span style={{ color: '#d1d5db' }}>—</span>}</div>
    </div>
)

const Empty = ({ text }) => (
    <p style={{ color: '#9ca3af', fontSize: '0.85rem', fontStyle: 'italic' }}>{text}</p>
)

export default function ChildDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        api.get(`/api/children/${id}/profile`)
            .then(r => setProfile(r.data.data))
            .catch(() => navigate('/'))
    }, [id])

    async function handleUpload(e) {
        e.preventDefault()
        if (!file) return
        const fd = new FormData()
        fd.append('file', file)
        fd.append('filename', file.name)
        fd.append('child_id', id)
        setUploading(true)
        try {
            await api.post('/api/media/upload-cloudinary', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const r = await api.get(`/api/children/${id}/profile`)
            setProfile(r.data.data)
            setFile(null)
            alert('Uploaded successfully!')
        } catch {
            alert('Upload failed')
        }
        setUploading(false)
    }

    if (!profile) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Georgia, serif', color: '#9ca3af' }}>
            Loading profile...
        </div>
    )

    const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF'
    const age = profile.date_of_birth
        ? Math.floor((new Date() - new Date(profile.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null

    const tabs = [
        { key: 'overview', label: '👤 Overview' },
        { key: 'health', label: '🍎 Health & Food' },
        { key: 'daily', label: '😴 Routines & Care' },
        { key: 'contacts', label: '📞 Contacts' },
        ...(isAdminOrStaff ? [{ key: 'media', label: '📸 Media' }] : []),
    ]

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
                padding: '2rem 2rem 3.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.06)' }} />

                <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', backdropFilter: 'blur(4px)' }}>
                        ← Back
                    </button>
                    <button onClick={() => navigate(`/children/${id}/edit`)} style={{ background: '#10b981', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                        ✏️ Edit Profile
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: profile.photo_url ? `url(${profile.photo_url}) center/cover` : 'linear-gradient(135deg, #10b981, #6366f1)',
                        border: '3px solid rgba(255,255,255,0.2)',
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, color: '#fff', fontWeight: 700
                    }}>
                        {!profile.photo_url && `${profile.first_name?.[0]}${profile.last_name?.[0]}`}
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                            {profile.first_name} {profile.last_name}
                        </h1>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {age !== null && <Tag label={`${age} yrs`} color="rgba(16,185,129,0.2)" textColor="#6ee7b7" />}
                            {profile.room_name && <Tag label={profile.room_name} color="rgba(99,102,241,0.2)" textColor="#a5b4fc" />}
                            {profile.gender && <Tag label={profile.gender} color="rgba(255,255,255,0.1)" textColor="#e2e8f0" />}
                            <Tag
                                label={profile.status || 'ACTIVE'}
                                color={profile.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}
                                textColor={profile.status === 'ACTIVE' ? '#6ee7b7' : '#fca5a5'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 1.5rem', display: 'flex', gap: 4, overflowX: 'auto', marginTop: -1 }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '1rem 1.2rem', fontSize: '0.85rem', fontWeight: 600,
                            color: activeTab === tab.key ? '#10b981' : '#6b7280',
                            borderBottom: activeTab === tab.key ? '2px solid #10b981' : '2px solid transparent',
                            whiteSpace: 'nowrap', transition: 'all 0.2s'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <Section icon="👤" title="Basic Information">
                            <Field label="Date of Birth" value={profile.date_of_birth} />
                            <Field label="Gender" value={profile.gender} />
                            <Field label="Room / Class" value={profile.room_name} />
                            <Field label="Enrollment Date" value={profile.enrollment_date} />
                            <Field label="Home Language" value={profile.home_language} />
                            <Field label="Religion" value={profile.religion} />
                            {profile.cultural_notes && <Field label="Cultural Notes" value={profile.cultural_notes} />}
                        </Section>

                        <Section icon="🧠" title="Personality">
                            {profile.personality ? (
                                <>
                                    <Field label="Temperament" value={profile.personality.temperament} />
                                    <Field label="Social Style" value={profile.personality.social_style} />
                                    <Field label="Learning Style" value={profile.personality.learning_style} />
                                    <Field label="Notes" value={profile.personality.notes} />
                                </>
                            ) : <Empty text="No personality profile added yet" />}
                        </Section>

                        <Section icon="😰" title="Fears">
                            {profile.fears?.length ? (
                                <div>{profile.fears.map((f, i) => <Tag key={i} label={f.fear || f.description} color="#fef2f2" textColor="#dc2626" />)}</div>
                            ) : <Empty text="No fears recorded" />}
                        </Section>

                        <Section icon="⭐" title="Interests">
                            {profile.interests?.length ? (
                                <div>{profile.interests.map((interest, i) => <Tag key={i} label={interest.interest || interest.description} color="#eff6ff" textColor="#2563eb" />)}</div>
                            ) : <Empty text="No interests recorded" />}
                        </Section>

                        <Section icon="💙" title="Emotional Support Plan">
                            {profile.emotional_support_plan ? (
                                <>
                                    <Field label="Triggers" value={profile.emotional_support_plan.triggers} />
                                    <Field label="Calming Strategies" value={profile.emotional_support_plan.calming_strategies} />
                                    <Field label="Notes" value={profile.emotional_support_plan.notes} />
                                </>
                            ) : <Empty text="No emotional support plan added" />}
                        </Section>

                        <Section icon="📈" title="Development">
                            {profile.development ? (
                                <>
                                    <Field label="Motor Skills" value={profile.development.motor_skills} />
                                    <Field label="Language Skills" value={profile.development.language_skills} />
                                    <Field label="Social Skills" value={profile.development.social_skills} />
                                    <Field label="Notes" value={profile.development.notes} />
                                </>
                            ) : <Empty text="No development profile added" />}
                        </Section>
                    </div>
                )}

                {/* HEALTH & FOOD TAB */}
                {activeTab === 'health' && (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <Section icon="🍎" title="Food Profile">
                            {profile.food_profile ? (
                                <>
                                    <Field label="Diet Type" value={profile.food_profile.diet_type} />
                                    <Field label="Meal Preferences" value={profile.food_profile.meal_preferences} />
                                    <Field label="Feeding Notes" value={profile.food_profile.feeding_notes} />
                                    {profile.food_profile.food_restrictions && (
                                        <Field label="Food Restrictions" value={profile.food_profile.food_restrictions} />
                                    )}
                                </>
                            ) : <Empty text="No food profile added" />}
                        </Section>

                        <Section icon="⚠️" title="Allergies">
                            {profile.allergies?.length ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {profile.allergies.map((a, i) => (
                                        <div key={i} style={{ background: '#fef2f2', borderRadius: 10, padding: '0.6rem 0.9rem', border: '1px solid #fecaca' }}>
                                            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.9rem' }}>{a.allergen}</div>
                                            {a.severity && <div style={{ fontSize: '0.78rem', color: '#ef4444' }}>Severity: {a.severity}</div>}
                                            {a.reaction && <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Reaction: {a.reaction}</div>}
                                        </div>
                                    ))}
                                </div>
                            ) : <Empty text="No allergies recorded" />}
                        </Section>
                    </div>
                )}

                {/* ROUTINES & CARE TAB */}
                {activeTab === 'daily' && (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <Section icon="😴" title="Daily Routines">
                            {profile.routines ? (
                                <>
                                    <Field label="Wake Time" value={profile.routines.wake_time} />
                                    <Field label="Nap Time" value={profile.routines.nap_time} />
                                    <Field label="Nap Duration" value={profile.routines.nap_duration} />
                                    <Field label="Bedtime" value={profile.routines.bedtime} />
                                    <Field label="Meal Times" value={profile.routines.meal_times} />
                                    <Field label="Notes" value={profile.routines.notes} />
                                </>
                            ) : <Empty text="No routine information added" />}
                        </Section>
                    </div>
                )}

                {/* CONTACTS TAB */}
                {activeTab === 'contacts' && (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        <Section icon="🚗" title="Authorized Pickups">
                            {profile.authorized_pickups?.length ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {profile.authorized_pickups.map((p, i) => (
                                        <div key={i} style={{ background: '#f0fdf4', borderRadius: 10, padding: '0.8rem 1rem', border: '1px solid #bbf7d0' }}>
                                            <div style={{ fontWeight: 700, color: '#15803d' }}>{p.full_name || p.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.link_type || p.relationship}</div>
                                            {p.phone && <div style={{ fontSize: '0.8rem', color: '#374151' }}>📞 {p.phone}</div>}
                                            {p.id_type && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID: {p.id_type} {p.id_number}</div>}
                                        </div>
                                    ))}
                                </div>
                            ) : <Empty text="No authorized pickups added" />}
                        </Section>

                        <Section icon="🆘" title="Emergency Contacts">
                            {profile.emergency_contacts?.length ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {profile.emergency_contacts.map((c, i) => (
                                        <div key={i} style={{ background: '#fff7ed', borderRadius: 10, padding: '0.8rem 1rem', border: '1px solid #fed7aa' }}>
                                            <div style={{ fontWeight: 700, color: '#c2410c' }}>{c.full_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{c.link_type} — Priority {c.contact_order}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#374151' }}>📞 {c.phone_primary}</div>
                                            {c.phone_secondary && <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>📞 {c.phone_secondary}</div>}
                                        </div>
                                    ))}
                                </div>
                            ) : <Empty text="No emergency contacts added" />}
                        </Section>
                    </div>
                )}

                {/* MEDIA TAB — Admin & Staff only */}
                {activeTab === 'media' && isAdminOrStaff && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Section icon="📸" title="Media Gallery">
                            {!profile.media || profile.media.length === 0 ? (
                                <Empty text="No media uploaded yet" />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                                    {profile.media.map(m => (
                                        <img key={m.id} src={m.url} alt="media"
                                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, border: '1px solid #f0f0f0' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </Section>

                        <Section icon="⬆️" title="Upload Media">
                            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={e => setFile(e.target.files[0])}
                                    style={{ fontSize: '0.85rem' }}
                                />
                                <button
                                    type="submit"
                                    disabled={uploading || !file}
                                    style={{
                                        background: uploading ? '#9ca3af' : '#10b981',
                                        color: '#fff', border: 'none', borderRadius: 8,
                                        padding: '0.6rem 1.2rem', cursor: uploading ? 'not-allowed' : 'pointer',
                                        fontWeight: 600, fontSize: '0.85rem', width: 'fit-content'
                                    }}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </form>
                        </Section>
                    </div>
                )}
            </div>
        </div>
    )
}
