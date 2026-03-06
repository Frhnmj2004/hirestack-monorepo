'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ScoreBreakdownChartProps {
    data: {
        name: string;
        technical: number;
        communication: number;
        leadership: number;
        problemSolving: number;
    }[];
}

export function ScoreBreakdownChart({ data }: ScoreBreakdownChartProps) {
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" strokeOpacity={0.05} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#FFFFFF"
                        strokeOpacity={0.4}
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#FFFFFF"
                        strokeOpacity={0.4}
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{ backgroundColor: '#1A1147', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="technical" name="Technical" stackId="a" fill="#5A46DA" />
                    <Bar dataKey="problemSolving" name="Problem Solving" stackId="a" fill="#9B8CFF" />
                    <Bar dataKey="communication" name="Communication" stackId="a" fill="#2E1F6B" />
                    <Bar dataKey="leadership" name="Leadership Guidance" stackId="a" fill="#10B981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
