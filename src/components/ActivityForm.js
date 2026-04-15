import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
import { activityCategories } from '../data/mockData';

const CATEGORIES = activityCategories.filter((c) => c !== 'All');

/* ─── Field helpers ──────────────────────────────────────────────── */

const FIELD_CLS =
    'w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors';
const FIELD_NORMAL =
    `${FIELD_CLS} border-gray-200 bg-white focus:ring-forest-900/20 focus:border-forest-600 hover:border-gray-300`;
const FIELD_ERROR =
    `${FIELD_CLS} border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-400`;

const ic = (err) => (err ? FIELD_ERROR : FIELD_NORMAL);

/* ─── Sub-components ─────────────────────────────────────────────── */

const SectionTitle = ({ children }) => (
    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{children}</h3>
);

const Divider = () => <hr className="border-gray-100" />;

const FieldRow = ({ label, required, error, children }) => (
    <div>
        {label && (
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
            </label>
        )}
        {children}
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
);

const ChevronDown = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const XSmall = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/* ─── Helpers ────────────────────────────────────────────────────── */

const EMPTY_FORM = {
    title: '',
    description: '',
    category: 'Adventure',
    city: '',
    price: '',
    duration: '',
    locationAddress: '',
    images: [],
};

const toFormState = (act) => ({
    title: act.title ?? '',
    description: act.description ?? '',
    category: act.category ?? 'Adventure',
    city: act.city ?? '',
    price: act.price ?? '',
    duration: act.duration ?? '',
    locationAddress:
        typeof act.location === 'string'
            ? act.location
            : act.location?.address ?? '',
    images: Array.isArray(act.images)
        ? [...act.images]
        : act.image
            ? [act.image]
            : [],
});

/* ─── ActivityForm ───────────────────────────────────────────────── */

/**
 * Slide-over panel for creating or editing an activity.
 *
 * Props
 * ─────────────────────────────────────────────────────
 * isOpen     boolean
 * activity   object | null  — null = create mode
 * loading    boolean        — disables form while API call is pending
 * onClose    () => void
 * onSubmit   (payload: object) => void
 */
const ActivityForm = ({ isOpen, activity, loading = false, onClose, onSubmit }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [imageUrl, setImageUrl] = useState('');
    const firstRef = useRef(null);
    const isEditing = !!activity;

    /* Reset form whenever the panel opens / the target activity changes */
    useEffect(() => {
        if (isOpen) {
            setForm(activity ? toFormState(activity) : EMPTY_FORM);
            setErrors({});
            setImageUrl('');
        }
    }, [isOpen, activity]);

    /* Focus first input */
    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => firstRef.current?.focus(), 80);
        return () => clearTimeout(t);
    }, [isOpen]);

    /* Close on Escape */
    useEffect(() => {
        if (!isOpen) return;
        const h = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [isOpen, loading, onClose]);

    const set = (name, val) => {
        setForm((prev) => ({ ...prev, [name]: val }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.description.trim()) e.description = 'Description is required';
        if (!form.city.trim()) e.city = 'City is required';
        if (!form.price || Number(form.price) <= 0) e.price = 'Enter a price greater than 0';
        if (!form.duration || Number(form.duration) <= 0) e.duration = 'Enter a duration greater than 0';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const addImage = () => {
        const url = imageUrl.trim();
        if (url && !form.images.includes(url)) {
            set('images', [...form.images, url]);
        }
        setImageUrl('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            city: form.city.trim(),
            price: Number(form.price),
            duration: Number(form.duration),
            images: form.images,
            location: { address: form.locationAddress.trim() },
        });
    };

    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={() => !loading && onClose()}
                className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Slide-over panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={isEditing ? 'Edit activity' : 'New activity'}
                className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <p className="text-[11px] font-bold text-forest-600 uppercase tracking-widest mb-0.5">
                            {isEditing ? 'Edit Activity' : 'New Activity'}
                        </p>
                        <h2 className="text-xl font-extrabold text-forest-950 leading-tight">
                            {isEditing ? (activity?.title || 'Edit') : 'Create Activity'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 disabled:opacity-50"
                    >
                        <XSmall />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 overflow-hidden"
                    noValidate
                >
                    <div className="flex flex-col gap-6 px-6 py-6 overflow-y-auto flex-1">

                        {/* Basic Info */}
                        <section aria-labelledby="section-basic">
                            <SectionTitle id="section-basic">Basic Info</SectionTitle>
                            <div className="flex flex-col gap-4">
                                <FieldRow label="Title" required error={errors.title}>
                                    <input
                                        ref={firstRef}
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => set('title', e.target.value)}
                                        placeholder="e.g. Sahara Camel Trek"
                                        className={ic(errors.title)}
                                    />
                                </FieldRow>

                                <FieldRow label="Category">
                                    <div className="relative">
                                        <select
                                            value={form.category}
                                            onChange={(e) => set('category', e.target.value)}
                                            className={`${ic()} appearance-none cursor-pointer pr-10`}
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <ChevronDown />
                                        </span>
                                    </div>
                                </FieldRow>
                            </div>
                        </section>

                        <Divider />

                        {/* Location */}
                        <section aria-labelledby="section-location">
                            <SectionTitle id="section-location">Location</SectionTitle>
                            <div className="flex flex-col gap-4">
                                <FieldRow label="City" required error={errors.city}>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => set('city', e.target.value)}
                                        placeholder="e.g. Agadir"
                                        className={ic(errors.city)}
                                    />
                                </FieldRow>
                                <FieldRow label="Address (optional)">
                                    <input
                                        type="text"
                                        value={form.locationAddress}
                                        onChange={(e) => set('locationAddress', e.target.value)}
                                        placeholder="e.g. near the south entrance of Erg Chebbi"
                                        className={ic()}
                                    />
                                </FieldRow>
                            </div>
                        </section>

                        <Divider />

                        {/* Pricing & Duration */}
                        <section aria-labelledby="section-pricing">
                            <SectionTitle id="section-pricing">Pricing &amp; Duration</SectionTitle>
                            <div className="grid grid-cols-2 gap-4">
                                <FieldRow label="Price (MAD)" required error={errors.price}>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold pointer-events-none">
                                            MAD
                                        </span>
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => set('price', e.target.value)}
                                            placeholder="250"
                                            min="1"
                                            className={`${ic(errors.price)} pl-11`}
                                        />
                                    </div>
                                </FieldRow>
                                <FieldRow label="Duration (hrs)" required error={errors.duration}>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={form.duration}
                                            onChange={(e) => set('duration', e.target.value)}
                                            placeholder="2"
                                            min="0.5"
                                            step="0.5"
                                            className={`${ic(errors.duration)} pr-11`}
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold pointer-events-none">
                                            hrs
                                        </span>
                                    </div>
                                </FieldRow>
                            </div>
                        </section>

                        <Divider />

                        {/* Description */}
                        <section aria-labelledby="section-desc">
                            <SectionTitle id="section-desc">Description</SectionTitle>
                            <FieldRow required error={errors.description}>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => set('description', e.target.value)}
                                    placeholder="What makes this activity special? What's included?"
                                    rows={4}
                                    className={`${ic(errors.description)} resize-none`}
                                />
                            </FieldRow>
                        </section>

                        <Divider />

                        {/* Images */}
                        <section aria-labelledby="section-images">
                            <SectionTitle id="section-images">Images</SectionTitle>
                            <p className="text-xs text-gray-400 -mt-2 mb-4 leading-relaxed">
                                Paste image URLs. Press Enter or click Add.
                            </p>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addImage();
                                        }
                                    }}
                                    placeholder="https://example.com/photo.jpg"
                                    className={`${FIELD_NORMAL} flex-1`}
                                />
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="flex-shrink-0 px-5 py-3 rounded-xl bg-forest-50 text-forest-700 text-sm font-semibold hover:bg-forest-100 transition-colors border border-forest-100"
                                >
                                    Add
                                </button>
                            </div>

                            {form.images.length > 0 && (
                                <ul className="flex flex-col gap-2">
                                    {form.images.map((url, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
                                        >
                                            <img
                                                src={url}
                                                alt=""
                                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-gray-200"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                            <span className="text-xs text-gray-500 truncate flex-1">{url}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    set('images', form.images.filter((_, j) => j !== i))
                                                }
                                                aria-label="Remove image"
                                                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <XSmall />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    {/* ── Footer actions ── */}
                    <div className="flex gap-3 px-6 py-5 border-t border-gray-100 flex-shrink-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-forest-900 text-white text-sm font-semibold hover:bg-forest-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <Spinner size="sm" />
                                : isEditing ? 'Save Changes' : 'Create Activity'}
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
};

export default ActivityForm;
