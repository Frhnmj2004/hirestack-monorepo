import { PageHeader } from '@/components/layout/PageHeader';
import { InterviewCard } from '@/components/features/interviews/InterviewCard';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

const MOCK_INTERVIEWS = [
    { id: '1', candidateName: 'Alex Harper', jobTitle: 'Senior Frontend Engineer', date: 'Oct 14, 2025', duration: '15 mins', status: 'Completed', score: 94 },
    { id: '2', candidateName: 'Sam Rivera', jobTitle: 'Senior Frontend Engineer', date: 'Oct 15, 2025', duration: '18 mins', status: 'Completed', score: 88 },
    { id: '3', candidateName: 'Jordan Lee', jobTitle: 'UX Designer', date: 'Oct 16, 2025', duration: '--', status: 'In Progress' },
    { id: '4', candidateName: 'Casey Smith', jobTitle: 'Backend Dev', date: 'Oct 17, 2025', duration: 'Scheduled 2:00 PM', status: 'Scheduled' },
    { id: '5', candidateName: 'Morgan Taylor', jobTitle: 'UX Designer', date: 'Oct 12, 2025', duration: '12 mins', status: 'Completed', score: 72 },
] as const;

export default function InterviewsPage() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="AI Interviews"
                description="Review completed AI interviews, read transcripts, and view candidate scores."
            >
                <Button
                    className="rounded-xl text-sm font-semibold text-white h-10 px-4 transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #5A46DA 0%, #7B6CFF 100%)',
                        boxShadow: '0 4px 15px rgba(90,70,218,0.35)',
                    }}
                >
                    <Video className="w-4 h-4 mr-2" />
                    Schedule Interview
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_INTERVIEWS.map((interview) => (
                    <InterviewCard key={interview.id} interview={interview} />
                ))}
            </div>
        </div>
    );
}
