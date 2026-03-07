'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const data = [
    { week: 'W1', applications: 240, screened: 40, hired: 2 },
    { week: 'W2', applications: 380, screened: 62, hired: 4 },
    { week: 'W3', applications: 310, screened: 55, hired: 3 },
    { week: 'W4', applications: 520, screened: 88, hired: 6 },
    { week: 'W5', applications: 470, screened: 75, hired: 5 },
    { week: 'W6', applications: 630, screened: 104, hired: 8 },
    { week: 'W7', applications: 580, screened: 96, hired: 7 },
    { week: 'W8', applications: 720, screened: 119, hired: 10 },
];

const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="p-3 rounded-xl text-xs"
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(230, 230, 240, 0.9)',
                    boxShadow: '0 8px 24px rgba(90, 70, 218, 0.12)',
                }}
            >
                <p className="font-semibold text-brand-light-textPrimary mb-2">{label}</p>
                {payload.map((p) => (
                    <div key={p.name} className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-brand-light-textSecondary capitalize">{p.name}:</span>
                        <span className="font-semibold text-brand-light-textPrimary">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function HiringVelocityChart() {
    return (
        <div
            className="p-6 rounded-2xl flex flex-col h-full"
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-semibold text-base text-brand-light-textPrimary">Hiring Velocity</h3>
                    <p className="text-xs text-brand-light-textSecondary mt-0.5">Applications vs. screened vs. hired · 8 weeks</p>
                </div>
                <div className="flex gap-1.5">
                    {(['4w', '8w', '12w'] as const).map((label, i) => (
                        <button
                            key={label}
                            className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-200"
                            style={i === 1
                                ? {
                                    background: 'linear-gradient(135deg, #5A46DA, #7B6CFF)',
                                    color: 'white',
                                    boxShadow: '0 2px 8px rgba(90, 70, 218, 0.3)',
                                }
                                : {
                                    background: 'rgba(90, 70, 218, 0.06)',
                                    color: '#6B6B8D',
                                }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradApplications" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5A46DA" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#5A46DA" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradScreened" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradHired" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(230, 230, 240, 0.7)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 11, fill: '#6B6B8D', fontFamily: 'inherit' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#6B6B8D', fontFamily: 'inherit' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(90, 70, 218, 0.15)', strokeWidth: 1 }} />
                        <Legend
                            wrapperStyle={{ fontSize: '11px', paddingTop: '12px', fontFamily: 'inherit' }}
                            iconType="circle"
                            iconSize={7}
                        />
                        <Area
                            type="monotone"
                            dataKey="applications"
                            stroke="#5A46DA"
                            strokeWidth={2}
                            fill="url(#gradApplications)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#5A46DA', strokeWidth: 2, stroke: 'white' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="screened"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            fill="url(#gradScreened)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: 'white' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="hired"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            fill="url(#gradHired)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'white' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
