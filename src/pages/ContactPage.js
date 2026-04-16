import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { showToast } from '../redux/ui/uiSlice';

const MailIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
);

const PhoneIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.15 9.81 19.8 19.8 0 01.08 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.12.86.31 1.7.57 2.5a2 2 0 01-.45 2.11L6 7a16 16 0 007 7l.67-1.18a2 2 0 012.11-.45c.8.26 1.64.45 2.5.57A2 2 0 0122 16.92z"
        />
    </svg>
);

const PinIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
);

const ContactPage = () => {
    const dispatch = useDispatch();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const canSubmit = useMemo(() => {
        const emailOk = /\S+@\S+\.\S+/.test(form.email.trim());
        return (
            form.name.trim().length >= 2 &&
            emailOk &&
            form.subject.trim().length >= 3 &&
            form.message.trim().length >= 10
        );
    }, [form]);

    const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) {
            dispatch(showToast({ type: 'warning', message: 'Please fill all fields (message ≥ 10 chars) with a valid email.' }));
            return;
        }
        setSubmitting(true);
        try {
            // No backend endpoint yet — simulate success.
            await new Promise((r) => setTimeout(r, 650));
            dispatch(showToast({ type: 'success', message: 'Message sent! We’ll get back to you shortly.' }));
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch {
            dispatch(showToast({ type: 'error', message: 'Failed to send message. Please try again.' }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="relative bg-forest-900 pt-32 pb-16 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-15"
                    style={{
                        backgroundImage:
                            'url(https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&q=80)',
                    }}
                />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="container mx-auto px-6 relative">
                    <p className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-3">✦ Support</p>
                    <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                        Contact <span className="text-gold-400">Us</span>
                    </h1>
                    <p className="text-white/70 text-lg max-w-2xl">
                        Questions about activities, bookings, or becoming a provider? Send a message—our team will reply as soon as possible.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-8">
                        <Link
                            to="/activities"
                            className="px-6 py-3 rounded-full bg-gold-500 text-forest-950 text-sm font-bold hover:bg-gold-400 transition-colors shadow-lg"
                        >
                            Explore Activities
                        </Link>
                        <Link
                            to="/about"
                            className="px-6 py-3 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors border border-white/15"
                        >
                            Learn more
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Contact cards */}
                    <div className="lg:col-span-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {[
                                {
                                    title: 'Email',
                                    value: 'support@afrikago.ma',
                                    hint: 'Best for detailed questions',
                                    icon: <MailIcon />,
                                    badge: 'text-forest-700 bg-forest-50 border-forest-100',
                                },
                                {
                                    title: 'Phone',
                                    value: '+212 6 00 00 00 00',
                                    hint: 'Mon–Fri · 9:00–18:00',
                                    icon: <PhoneIcon />,
                                    badge: 'text-gold-700 bg-gold-50 border-gold-100',
                                },
                                {
                                    title: 'Office',
                                    value: 'Marrakech, Morocco',
                                    hint: 'Visits by appointment',
                                    icon: <PinIcon />,
                                    badge: 'text-gray-700 bg-white border-gray-100',
                                },
                            ].map((c) => (
                                <div
                                    key={c.title}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${c.badge}`}>
                                        {c.icon}
                                    </div>
                                    <h3 className="mt-4 font-bold text-gray-900">{c.title}</h3>
                                    <p className="mt-1 text-sm font-semibold text-forest-950">{c.value}</p>
                                    <p className="mt-2 text-xs text-gray-500">{c.hint}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-3xl bg-forest-900 text-white p-7 overflow-hidden relative">
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
                            <p className="text-white/75 text-sm font-semibold uppercase tracking-widest mb-2">✦ Become a partner</p>
                            <h3 className="text-2xl font-extrabold">Are you a provider?</h3>
                            <p className="text-white/70 text-sm mt-2 max-w-md">
                                If you run tours or activities, we’d love to feature your offers on AfrikaGo.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex mt-5 px-6 py-3 rounded-full bg-gold-500 text-forest-950 text-sm font-bold hover:bg-gold-400 transition-colors shadow-lg"
                            >
                                Create provider account
                            </Link>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Send a message</h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    We usually reply within 24–48 hours.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Full name</label>
                                        <input
                                            value={form.name}
                                            onChange={onChange('name')}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-900/25"
                                            placeholder="Your name"
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Email</label>
                                        <input
                                            value={form.email}
                                            onChange={onChange('email')}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-900/25"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            inputMode="email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">Subject</label>
                                    <input
                                        value={form.subject}
                                        onChange={onChange('subject')}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-900/25"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">Message</label>
                                    <textarea
                                        value={form.message}
                                        onChange={onChange('message')}
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-900/25 resize-none"
                                        placeholder="Write your message…"
                                    />
                                    <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                        <span>Minimum 10 characters</span>
                                        <span>{form.message.trim().length} / 10</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={!canSubmit || submitting}
                                        className="w-full sm:w-auto px-7 py-3 rounded-full bg-forest-900 text-white text-sm font-bold hover:bg-forest-800 active:bg-forest-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-forest-900/15"
                                    >
                                        {submitting ? 'Sending…' : 'Send message'}
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        By sending, you agree to be contacted regarding your request.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;

