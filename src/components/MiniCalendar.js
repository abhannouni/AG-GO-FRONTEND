import React from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Visual config per day status.
 * `cell`  – Tailwind classes applied to the day button when NOT selected and NOT past
 * `dot`   – colour of the small indicator dot shown below the day number
 * `label` – legend label (null = hidden from legend)
 */
const STATUS_CONFIG = {
    available: {
        cell: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 cursor-pointer',
        dot: 'bg-emerald-500',
        label: 'Available',
    },
    full: {
        cell: 'bg-amber-50 border-amber-100 text-amber-600 cursor-not-allowed',
        dot: 'bg-amber-400',
        label: 'Fully booked',
    },
    blocked: {
        cell: 'bg-red-50 border-red-100 text-red-300 cursor-not-allowed',
        dot: 'bg-red-400',
        label: 'Blocked',
    },
    none: {
        cell: 'border-transparent text-gray-300 cursor-not-allowed',
        dot: null,
        label: null,
    },
    past: {
        cell: 'border-transparent text-gray-200 cursor-not-allowed',
        dot: null,
        label: null,
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MiniCalendar – a reusable month-grid calendar component.
 *
 * Props:
 *   year            – number  displayed year
 *   month           – number  displayed month (1–12)
 *   onMonthChange   – (year, month) => void   called when user navigates
 *   selectedDate    – "YYYY-MM-DD" | null     currently selected date
 *   onDateSelect    – (dateStr) => void        called when a selectable day is clicked
 *   dateStatusMap   – { [YYYY-MM-DD]: 'available'|'full'|'blocked'|'none'|'past' }
 *   loading         – bool   show spinner instead of grid
 *   minDate         – "YYYY-MM-DD"  dates before this are shown as 'past' and disabled
 *   showLegend      – bool   (default true) render colour legend below calendar
 *   allowAllFuture  – bool   (default false) if true ALL non-past dates are clickable,
 *                            regardless of their status in dateStatusMap (used by providers
 *                            who can set availability on any future date, including 'none')
 */
const MiniCalendar = ({
    year,
    month,
    onMonthChange,
    selectedDate,
    onDateSelect,
    dateStatusMap = {},
    loading = false,
    minDate = null,
    showLegend = true,
    allowAllFuture = false,
}) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effectiveMin = minDate || todayStr;

    // Build calendar grid (Monday-first)
    const daysInMonth = new Date(year, month, 0).getDate();          // day 0 of next month = last day of this month
    const firstDow = new Date(year, month - 1, 1).getDay();       // 0=Sun
    const firstDowMon = (firstDow + 6) % 7;                          // 0=Mon … 6=Sun

    const cells = [];
    for (let i = 0; i < firstDowMon; i++) cells.push(null);          // leading empty cells
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // Navigation helpers
    const todayYear = new Date().getFullYear();
    const todayMonth = new Date().getMonth() + 1;
    const canGoPrev = year > todayYear || (year === todayYear && month > todayMonth);

    const prevMonth = () => {
        if (month === 1) onMonthChange(year - 1, 12);
        else onMonthChange(year, month - 1);
    };
    const nextMonth = () => {
        if (month === 12) onMonthChange(year + 1, 1);
        else onMonthChange(year, month + 1);
    };

    const getDateStr = (day) =>
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const getStatus = (dateStr) => {
        if (dateStr < effectiveMin) return 'past';
        return dateStatusMap[dateStr] || 'none';
    };

    const isClickable = (dateStr) => {
        const status = getStatus(dateStr);
        if (status === 'past') return false;
        if (allowAllFuture) return true;          // providers can click any future date
        return status === 'available';            // clients can only pick dates with open slots
    };

    return (
        <div className="select-none w-full">
            {/* ── Month navigation header ─────────────────────────────────── */}
            <div className="flex items-center justify-between mb-3 px-1">
                <button
                    type="button"
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous month"
                >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <span className="text-sm font-bold text-gray-800">
                    {MONTH_NAMES[month - 1]} {year}
                </span>

                <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Next month"
                >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <svg className="w-6 h-6 animate-spin text-forest-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            ) : (
                <>
                    {/* ── Day-of-week headers ─────────────────────────────── */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS_SHORT.map((d) => (
                            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* ── Day grid ────────────────────────────────────────── */}
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={`e-${idx}`} />;

                            const dateStr = getDateStr(day);
                            const status = getStatus(dateStr);
                            const selected = selectedDate === dateStr;
                            const clickable = isClickable(dateStr);
                            const isToday = dateStr === todayStr;
                            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.none;

                            return (
                                <button
                                    key={dateStr}
                                    type="button"
                                    onClick={() => clickable && onDateSelect(dateStr)}
                                    disabled={!clickable}
                                    title={cfg.label || ''}
                                    className={[
                                        'relative flex flex-col items-center justify-center rounded-lg border',
                                        'w-full aspect-square text-xs font-semibold transition-all',
                                        selected
                                            ? 'bg-forest-900 border-forest-900 text-white ring-2 ring-forest-400 ring-offset-1'
                                            : cfg.cell,
                                        isToday && !selected ? 'ring-2 ring-forest-300 ring-offset-1' : '',
                                    ].join(' ')}
                                >
                                    <span>{day}</span>
                                    {/* Status dot */}
                                    {cfg.dot && !selected && (
                                        <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${cfg.dot}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Legend ──────────────────────────────────────────── */}
                    {showLegend && (
                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                            {Object.entries(STATUS_CONFIG)
                                .filter(([, v]) => v.dot)
                                .map(([key, v]) => (
                                    <span key={key} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <span className={`w-2 h-2 rounded-full ${v.dot}`} />
                                        {v.label}
                                    </span>
                                ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MiniCalendar;
