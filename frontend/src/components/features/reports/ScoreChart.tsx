'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ScoreChartProps {
    data: {
        subject: string;
        score: number;
        fullMark: number;
    }[];
}

export function ScoreChart({ data }: ScoreChartProps) {
    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#FFFFFF" strokeOpacity={0.1} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0B0726', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#9B8CFF' }}
                    />
                    <Radar
                        name="Candidate Fit"
                        dataKey="score"
                        stroke="#5A46DA"
                        fill="#5A46DA"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
