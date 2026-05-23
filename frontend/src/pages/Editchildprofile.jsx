import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb',
    borderRadius: 8, fontSize: '0.9rem', color: '#1f2937',
    outline: 'none', boxSizing: 'border-box', background: '#fafafa'
}

const labelStyle = {
    fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4
}

const sectionStyle = {
    background: '#fff', borderRadius: 16, padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0',
    marginBottom: '1rem'
}

const sectionTitleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e',
    marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 8
}

const btnPrimary = {
    background: '#10b981', color: '#fff', border: 'none',
    borderRadius: 8, padding: '0.55rem 1.2rem', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.85rem'
}

const btnSecondary = {
    background: '#f3f4f6', color: '#374151', border: 'none',
    borderRadius: 8, padding: '0.55rem 1.2rem', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.85rem'
}

const FormField = ({ label, children }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>{label}</label>
        {children}
    </div>
)

export default function EditChildProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [activeTab, setActiveTab] = useState('personality')
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState(null)

    // Form states
    const [personality, setPersonality] = useState({ favorite_toys: '', favorite_activities: '', favorite_sports: '', favorite_books: '', favorite_songs: '', comfort_objects: '', dislikes: '', things_that_calm_them: '', things_that_excite_them: '', social_style: '', learning_style: '', temperament_notes: '' })
    const [foodProfile, setFoodProfile] = useState({ diet_type: '', meal_preferences: '', feeding_notes: '', food_restrictions: '' })
    const [routines, setRoutines] = useState({ usual_wake_time: '', usual_sleep_time: '', nap_duration_minutes: '', nap_preferences: '', bedtime_rituals: '', morning_mood: '', potty_training_stage: 'NOT_STARTED', uses_pacifier: false, uses_comfort_blanket: false, comfort_blanket_desc: '', special_routines: '' })
    const [development, setDevelopment] = useState({ walking_stage: 'NOT_WALKING', talking_stage: 'BABBLING', feeding_stage: 'MILK_ONLY', toilet_stage: 'NOT_STARTED', milestones_achieved: '', areas_to_support: '', staff_observations: '' })
    const [esp, setEsp] = useState({ separation_anxiety_notes: '', calming_techniques: '', triggers_to_avoid: '', positive_reinforcements: '', behavioral_notes: '', staff_guidance: '' })

    // List forms
    const [allergy, setAllergy] = useState({ allergen: '', severity: 'MILD', reaction: '', notes: '' })
    const [fear, setFear] = useState({ fear_description: '', severity: 'MILD', triggers: '', coping_strategy: '' })
    const [interest, setInterest] = useState({ interest_category: 'OTHER', specific_interest: '', enthusiasm_level: 'LIKES', notes: '' })
    const [pickup, setPickup] = useState({ full_name: '', phone: '', link_type: '', id_type: '', id_number: '' })
    const [emergency, setEmergency] = useState({ full_name: '', link_type: '', phone_primary: '', phone_secondary: '', contact_order: 1 })

    useEffect(() => {
        api.get(`/api/children/${id}/profile`).then(r => {
            const p = r.data.data
            setProfile(p)
            if (p.personality) setPersonality({ ...personality, ...p.personality })
            if (p.food_profile) setFoodProfile({ ...foodProfile, ...p.food_profile })
            if (p.routines) setRoutines({ ...routines, ...p.routines })
            if (p.development) setDevelopment({ ...development, ...p.development })
            if (p.emotional_support_plan) setEsp({ ...esp, ...p.emotional_support_plan })
        }).catch(() => navigate('/'))
    }, [id])

    const cleanPayload = (obj) =>
        Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v]))

    const save = async (endpoint, data, method = 'put') => {
        setSaving(true)
        setSuccess(null)
        setError(null)
        try {
            await api[method](endpoint, cleanPayload(data))
            setSuccess('Saved successfully!')
            const r = await api.get(`/api/children/${id}/profile`)
            setProfile(r.data.data)
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to save')
        }
        setSaving(false)
    }

    const tabs = [
        { key: 'personality', label: '🧠 Personality' },
        { key: 'food', label: '🍎 Food & Diet' },
        { key: 'routines', label: '😴 Routines' },
        { key: 'development', label: '📈 Development' },
        { key: 'emotional', label: '💙 Emotional' },
        { key: 'allergies', label: '⚠️ Allergies' },
        { key: 'fears', label: '😰 Fears' },
        { key: 'interests', label: '⭐ Interests' },
        { key: 'pickups', label: '🚗 Pickups' },
        { key: 'emergency', label: '🆘 Emergency' },
    ]

    if (!profile) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af' }}>
            Loading...
        </div>
    )

    return (
        <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafb', minHeight: '100vh', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', padding: '2rem 2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
                <button onClick={() => navigate(`/children/${id}`)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.2rem', backdropFilter: 'blur(4px)' }}>
                    ← Back to Profile
                </button>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Edit Profile — {profile.first_name} {profile.last_name}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 4 }}>
                    Update child information across all sections
                </p>
            </div>

            {/* Tabs */}
            <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 1.5rem', display: 'flex', gap: 4, overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '1rem 1rem', fontSize: '0.82rem', fontWeight: 600,
                        color: activeTab === tab.key ? '#10b981' : '#6b7280',
                        borderBottom: activeTab === tab.key ? '2px solid #10b981' : '2px solid transparent',
                        whiteSpace: 'nowrap', transition: 'all 0.2s'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Status messages */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem 1.5rem 0' }}>
                {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.85rem', marginBottom: 12 }}>✅ {success}</div>}
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.85rem', marginBottom: 12 }}>❌ {error}</div>}
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 1.5rem' }}>

                {/* PERSONALITY */}
                {activeTab === 'personality' && (
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}><span>🧠</span> Personality Profile</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                            {[['Favorite Toys', 'favorite_toys'], ['Favorite Activities', 'favorite_activities'], ['Favorite Sports', 'favorite_sports'], ['Favorite Books', 'favorite_books'], ['Favorite Songs', 'favorite_songs'], ['Comfort Objects', 'comfort_objects'], ['Social Style', 'social_style'], ['Learning Style', 'learning_style']].map(([label, key]) => (
                                <FormField key={key} label={label}>
                                    <input style={inputStyle} value={personality[key] || ''} onChange={e => setPersonality({ ...personality, [key]: e.target.value })} />
                                </FormField>
                            ))}
                        </div>
                        {[['Dislikes', 'dislikes'], ['Things That Calm Them', 'things_that_calm_them'], ['Things That Excite Them', 'things_that_excite_them'], ['Temperament Notes', 'temperament_notes']].map(([label, key]) => (
                            <FormField key={key} label={label}>
                                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={personality[key] || ''} onChange={e => setPersonality({ ...personality, [key]: e.target.value })} />
                            </FormField>
                        ))}
                        <button style={btnPrimary} disabled={saving} onClick={() => save(`/api/children/${id}/personality`, personality)}>
                            {saving ? 'Saving...' : 'Save Personality'}
                        </button>
                    </div>
                )}

                {/* FOOD */}
                {activeTab === 'food' && (
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}><span>🍎</span> Food & Diet Profile</div>
                        <FormField label="Diet Type"><input style={inputStyle} value={foodProfile.diet_type || ''} onChange={e => setFoodProfile({ ...foodProfile, diet_type: e.target.value })} placeholder="e.g. Vegetarian, Halal, Vegan" /></FormField>
                        <FormField label="Meal Preferences"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={foodProfile.meal_preferences || ''} onChange={e => setFoodProfile({ ...foodProfile, meal_preferences: e.target.value })} /></FormField>
                        <FormField label="Food Restrictions"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={foodProfile.food_restrictions || ''} onChange={e => setFoodProfile({ ...foodProfile, food_restrictions: e.target.value })} /></FormField>
                        <FormField label="Feeding Notes"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={foodProfile.feeding_notes || ''} onChange={e => setFoodProfile({ ...foodProfile, feeding_notes: e.target.value })} /></FormField>
                        <button style={btnPrimary} disabled={saving} onClick={() => save(`/api/children/${id}/food-profile`, foodProfile)}>
                            {saving ? 'Saving...' : 'Save Food Profile'}
                        </button>
                    </div>
                )}

                {/* ROUTINES */}
                {activeTab === 'routines' && (
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}><span>😴</span> Daily Routines</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                            <FormField label="Wake Time"><input type="time" style={inputStyle} value={routines.usual_wake_time || ''} onChange={e => setRoutines({ ...routines, usual_wake_time: e.target.value })} /></FormField>
                            <FormField label="Sleep Time"><input type="time" style={inputStyle} value={routines.usual_sleep_time || ''} onChange={e => setRoutines({ ...routines, usual_sleep_time: e.target.value })} /></FormField>
                            <FormField label="Nap Duration (minutes)"><input type="number" style={inputStyle} value={routines.nap_duration_minutes || ''} onChange={e => setRoutines({ ...routines, nap_duration_minutes: e.target.value })} /></FormField>
                            <FormField label="Potty Training Stage">
                                <select style={inputStyle} value={routines.potty_training_stage || 'NOT_STARTED'} onChange={e => setRoutines({ ...routines, potty_training_stage: e.target.value })}>
                                    {['NOT_STARTED', 'AWARE', 'IN_TRAINING', 'MOSTLY_TRAINED', 'FULLY_TRAINED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </FormField>
                        </div>
                        <FormField label="Nap Preferences"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={routines.nap_preferences || ''} onChange={e => setRoutines({ ...routines, nap_preferences: e.target.value })} /></FormField>
                        <FormField label="Bedtime Rituals"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={routines.bedtime_rituals || ''} onChange={e => setRoutines({ ...routines, bedtime_rituals: e.target.value })} /></FormField>
                        <FormField label="Morning Mood"><input style={inputStyle} value={routines.morning_mood || ''} onChange={e => setRoutines({ ...routines, morning_mood: e.target.value })} /></FormField>
                        <FormField label="Special Routines"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={routines.special_routines || ''} onChange={e => setRoutines({ ...routines, special_routines: e.target.value })} /></FormField>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={routines.uses_pacifier || false} onChange={e => setRoutines({ ...routines, uses_pacifier: e.target.checked })} />
                                Uses Pacifier
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={routines.uses_comfort_blanket || false} onChange={e => setRoutines({ ...routines, uses_comfort_blanket: e.target.checked })} />
                                Uses Comfort Blanket
                            </label>
                        </div>
                        {routines.uses_comfort_blanket && (
                            <FormField label="Comfort Blanket Description"><input style={inputStyle} value={routines.comfort_blanket_desc || ''} onChange={e => setRoutines({ ...routines, comfort_blanket_desc: e.target.value })} /></FormField>
                        )}
                        <button style={btnPrimary} disabled={saving} onClick={() => save(`/api/children/${id}/routines`, routines)}>
                            {saving ? 'Saving...' : 'Save Routines'}
                        </button>
                    </div>
                )}

                {/* DEVELOPMENT */}
                {activeTab === 'development' && (
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}><span>📈</span> Development</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                            <FormField label="Walking Stage">
                                <select style={inputStyle} value={development.walking_stage} onChange={e => setDevelopment({ ...development, walking_stage: e.target.value })}>
                                    {['NOT_WALKING', 'SUPPORTED', 'CRUISING', 'INDEPENDENT'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Talking Stage">
                                <select style={inputStyle} value={development.talking_stage} onChange={e => setDevelopment({ ...development, talking_stage: e.target.value })}>
                                    {['BABBLING', 'FIRST_WORDS', 'TWO_WORDS', 'SENTENCES', 'FLUENT'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Feeding Stage">
                                <select style={inputStyle} value={development.feeding_stage} onChange={e => setDevelopment({ ...development, feeding_stage: e.target.value })}>
                                    {['MILK_ONLY', 'INTRODUCING_SOLIDS', 'MIXED', 'TABLE_FOOD'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Toilet Stage">
                                <select style={inputStyle} value={development.toilet_stage} onChange={e => setDevelopment({ ...development, toilet_stage: e.target.value })}>
                                    {['NOT_STARTED', 'AWARE', 'IN_TRAINING', 'MOSTLY_TRAINED', 'FULLY_TRAINED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </FormField>
                        </div>
                        <FormField label="Milestones Achieved"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={development.milestones_achieved || ''} onChange={e => setDevelopment({ ...development, milestones_achieved: e.target.value })} /></FormField>
                        <FormField label="Areas to Support"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={development.areas_to_support || ''} onChange={e => setDevelopment({ ...development, areas_to_support: e.target.value })} /></FormField>
                        <FormField label="Staff Observations"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={development.staff_observations || ''} onChange={e => setDevelopment({ ...development, staff_observations: e.target.value })} /></FormField>
                        <button style={btnPrimary} disabled={saving} onClick={() => save(`/api/children/${id}/development`, development)}>
                            {saving ? 'Saving...' : 'Save Development'}
                        </button>
                    </div>
                )}

                {/* EMOTIONAL SUPPORT */}
                {activeTab === 'emotional' && (
                    <div style={sectionStyle}>
                        <div style={sectionTitleStyle}><span>💙</span> Emotional Support Plan</div>
                        {[['Separation Anxiety Notes', 'separation_anxiety_notes'], ['Calming Techniques', 'calming_techniques'], ['Triggers to Avoid', 'triggers_to_avoid'], ['Positive Reinforcements', 'positive_reinforcements'], ['Behavioral Notes', 'behavioral_notes'], ['Staff Guidance', 'staff_guidance']].map(([label, key]) => (
                            <FormField key={key} label={label}>
                                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={esp[key] || ''} onChange={e => setEsp({ ...esp, [key]: e.target.value })} />
                            </FormField>
                        ))}
                        <button style={btnPrimary} disabled={saving} onClick={() => save(`/api/children/${id}/emotional-support-plan`, esp)}>
                            {saving ? 'Saving...' : 'Save Emotional Support Plan'}
                        </button>
                    </div>
                )}

                {/* ALLERGIES */}
                {activeTab === 'allergies' && (
                    <div>
                        {/* Existing */}
                        {profile.allergies?.length > 0 && (
                            <div style={sectionStyle}>
                                <div style={sectionTitleStyle}><span>⚠️</span> Current Allergies</div>
                                {profile.allergies.map((a, i) => (
                                    <div key={i} style={{ background: '#fef2f2', borderRadius: 10, padding: '0.7rem 1rem', border: '1px solid #fecaca', marginBottom: 8 }}>
                                        <div style={{ fontWeight: 700, color: '#dc2626' }}>{a.allergen}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Severity: {a.severity} {a.reaction ? `· Reaction: ${a.reaction}` : ''}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}><span>➕</span> Add Allergy</div>
                            <FormField label="Allergen"><input style={inputStyle} value={allergy.allergen} onChange={e => setAllergy({ ...allergy, allergen: e.target.value })} placeholder="e.g. Peanuts, Dairy" /></FormField>
                            <FormField label="Severity">
                                <select style={inputStyle} value={allergy.severity} onChange={e => setAllergy({ ...allergy, severity: e.target.value })}>
                                    {['MILD', 'MODERATE', 'SEVERE'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Reaction"><input style={inputStyle} value={allergy.reaction} onChange={e => setAllergy({ ...allergy, reaction: e.target.value })} placeholder="e.g. Rash, Swelling" /></FormField>
                            <FormField label="Notes"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={allergy.notes} onChange={e => setAllergy({ ...allergy, notes: e.target.value })} /></FormField>
                            <button style={btnPrimary} disabled={saving || !allergy.allergen} onClick={async () => {
                                await save(`/api/children/${id}/allergies`, allergy, 'post')
                                setAllergy({ allergen: '', severity: 'MILD', reaction: '', notes: '' })
                            }}>
                                {saving ? 'Adding...' : 'Add Allergy'}
                            </button>
                        </div>
                    </div>
                )}

                {/* FEARS */}
                {activeTab === 'fears' && (
                    <div>
                        {profile.fears?.length > 0 && (
                            <div style={sectionStyle}>
                                <div style={sectionTitleStyle}><span>😰</span> Current Fears</div>
                                {profile.fears.map((f, i) => (
                                    <div key={i} style={{ background: '#fef2f2', borderRadius: 10, padding: '0.7rem 1rem', border: '1px solid #fecaca', marginBottom: 8 }}>
                                        <div style={{ fontWeight: 700, color: '#dc2626' }}>{f.fear_description}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Severity: {f.severity}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}><span>➕</span> Add Fear</div>
                            <FormField label="Fear Description"><input style={inputStyle} value={fear.fear_description} onChange={e => setFear({ ...fear, fear_description: e.target.value })} placeholder="e.g. Loud noises, Strangers" /></FormField>
                            <FormField label="Severity">
                                <select style={inputStyle} value={fear.severity} onChange={e => setFear({ ...fear, severity: e.target.value })}>
                                    {['MILD', 'MODERATE', 'SEVERE'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Triggers"><input style={inputStyle} value={fear.triggers} onChange={e => setFear({ ...fear, triggers: e.target.value })} /></FormField>
                            <FormField label="Coping Strategy"><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={fear.coping_strategy} onChange={e => setFear({ ...fear, coping_strategy: e.target.value })} /></FormField>
                            <button style={btnPrimary} disabled={saving || !fear.fear_description} onClick={async () => {
                                await save(`/api/children/${id}/fears`, fear, 'post')
                                setFear({ fear_description: '', severity: 'MILD', triggers: '', coping_strategy: '' })
                            }}>
                                {saving ? 'Adding...' : 'Add Fear'}
                            </button>
                        </div>
                    </div>
                )}

                {/* INTERESTS */}
                {activeTab === 'interests' && (
                    <div>
                        {profile.interests?.length > 0 && (
                            <div style={sectionStyle}>
                                <div style={sectionTitleStyle}><span>⭐</span> Current Interests</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {profile.interests.map((i, idx) => (
                                        <span key={idx} style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {i.specific_interest} ({i.interest_category})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}><span>➕</span> Add Interest</div>
                            <FormField label="Category">
                                <select style={inputStyle} value={interest.interest_category} onChange={e => setInterest({ ...interest, interest_category: e.target.value })}>
                                    {['SPORTS', 'ARTS', 'MUSIC', 'ANIMALS', 'VEHICLES', 'NATURE', 'BOOKS', 'TECHNOLOGY', 'DANCE', 'COOKING', 'OTHER'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Specific Interest"><input style={inputStyle} value={interest.specific_interest} onChange={e => setInterest({ ...interest, specific_interest: e.target.value })} placeholder="e.g. Dinosaurs, Painting" /></FormField>
                            <FormField label="Enthusiasm Level">
                                <select style={inputStyle} value={interest.enthusiasm_level} onChange={e => setInterest({ ...interest, enthusiasm_level: e.target.value })}>
                                    {['LOVES', 'LIKES', 'NEUTRAL'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Notes"><input style={inputStyle} value={interest.notes} onChange={e => setInterest({ ...interest, notes: e.target.value })} /></FormField>
                            <button style={btnPrimary} disabled={saving || !interest.specific_interest} onClick={async () => {
                                await save(`/api/children/${id}/interests`, interest, 'post')
                                setInterest({ interest_category: 'OTHER', specific_interest: '', enthusiasm_level: 'LIKES', notes: '' })
                            }}>
                                {saving ? 'Adding...' : 'Add Interest'}
                            </button>
                        </div>
                    </div>
                )}

                {/* AUTHORIZED PICKUPS */}
                {activeTab === 'pickups' && (
                    <div>
                        {profile.authorized_pickups?.length > 0 && (
                            <div style={sectionStyle}>
                                <div style={sectionTitleStyle}><span>🚗</span> Current Authorized Pickups</div>
                                {profile.authorized_pickups.map((p, i) => (
                                    <div key={i} style={{ background: '#f0fdf4', borderRadius: 10, padding: '0.7rem 1rem', border: '1px solid #bbf7d0', marginBottom: 8 }}>
                                        <div style={{ fontWeight: 700, color: '#15803d' }}>{p.full_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{p.link_type} · 📞 {p.phone}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}><span>➕</span> Add Authorized Pickup</div>
                            <FormField label="Full Name"><input style={inputStyle} value={pickup.full_name} onChange={e => setPickup({ ...pickup, full_name: e.target.value })} /></FormField>
                            <FormField label="Phone"><input style={inputStyle} value={pickup.phone} onChange={e => setPickup({ ...pickup, phone: e.target.value })} /></FormField>
                            <FormField label="Relationship"><input style={inputStyle} value={pickup.link_type} onChange={e => setPickup({ ...pickup, link_type: e.target.value })} placeholder="e.g. Grandmother, Uncle" /></FormField>
                            <FormField label="ID Type"><input style={inputStyle} value={pickup.id_type} onChange={e => setPickup({ ...pickup, id_type: e.target.value })} placeholder="e.g. Passport, Driver's License" /></FormField>
                            <FormField label="ID Number"><input style={inputStyle} value={pickup.id_number} onChange={e => setPickup({ ...pickup, id_number: e.target.value })} /></FormField>
                            <button style={btnPrimary} disabled={saving || !pickup.full_name || !pickup.phone} onClick={async () => {
                                await save(`/api/children/${id}/authorized-pickups`, pickup, 'post')
                                setPickup({ full_name: '', phone: '', link_type: '', id_type: '', id_number: '' })
                            }}>
                                {saving ? 'Adding...' : 'Add Pickup Person'}
                            </button>
                        </div>
                    </div>
                )}

                {/* EMERGENCY CONTACTS */}
                {activeTab === 'emergency' && (
                    <div>
                        {profile.emergency_contacts?.length > 0 && (
                            <div style={sectionStyle}>
                                <div style={sectionTitleStyle}><span>🆘</span> Current Emergency Contacts</div>
                                {profile.emergency_contacts.map((c, i) => (
                                    <div key={i} style={{ background: '#fff7ed', borderRadius: 10, padding: '0.7rem 1rem', border: '1px solid #fed7aa', marginBottom: 8 }}>
                                        <div style={{ fontWeight: 700, color: '#c2410c' }}>{c.full_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{c.link_type} · Priority {c.contact_order} · 📞 {c.phone_primary}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={sectionStyle}>
                            <div style={sectionTitleStyle}><span>➕</span> Add Emergency Contact</div>
                            <FormField label="Full Name"><input style={inputStyle} value={emergency.full_name} onChange={e => setEmergency({ ...emergency, full_name: e.target.value })} /></FormField>
                            <FormField label="Relationship"><input style={inputStyle} value={emergency.link_type} onChange={e => setEmergency({ ...emergency, link_type: e.target.value })} placeholder="e.g. Father, Aunt" /></FormField>
                            <FormField label="Primary Phone"><input style={inputStyle} value={emergency.phone_primary} onChange={e => setEmergency({ ...emergency, phone_primary: e.target.value })} /></FormField>
                            <FormField label="Secondary Phone"><input style={inputStyle} value={emergency.phone_secondary} onChange={e => setEmergency({ ...emergency, phone_secondary: e.target.value })} /></FormField>
                            <FormField label="Contact Priority">
                                <select style={inputStyle} value={emergency.contact_order} onChange={e => setEmergency({ ...emergency, contact_order: parseInt(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </FormField>
                            <button style={btnPrimary} disabled={saving || !emergency.full_name || !emergency.phone_primary} onClick={async () => {
                                await save(`/api/children/${id}/emergency-contacts`, emergency, 'post')
                                setEmergency({ full_name: '', link_type: '', phone_primary: '', phone_secondary: '', contact_order: 1 })
                            }}>
                                {saving ? 'Adding...' : 'Add Emergency Contact'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
