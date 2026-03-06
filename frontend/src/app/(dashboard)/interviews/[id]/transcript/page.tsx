import { PageHeader } from '@/components/layout/PageHeader';
import { TranscriptViewer } from '@/components/features/interviews/TranscriptViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const MOCK_TRANSCRIPT = [
    { id: '1', sender: 'ai' as const, text: 'Hello Alex. Im the HireLens AI interviewer. Thanks for taking the time to speak with me today regarding the Senior Frontend Engineer position. Are you ready to begin?', timestamp: '2:00 PM' },
    { id: '2', sender: 'candidate' as const, text: 'Hi! Yes, Im ready.', timestamp: '2:01 PM' },
    { id: '3', sender: 'ai' as const, text: 'Great. Lets start with state management. The team is currently migrating from Redux to Zustand. Can you discuss your experience with Zustand and why a team might choose it over Redux or React Context?', timestamp: '2:01 PM' },
    { id: '4', sender: 'candidate' as const, text: 'Sure. I actually led a similar migration last year. Zustand is fantastic because it eliminates the boilerplate of Redux—no actions, reducers, or dispatch types needed for simple state. It uses hooks directly and avoids the Provider wrapper hell you get with React Context if you split states up too granularly. Plus, Zustand bounds re-renders better than Context without extra memoization.', timestamp: '2:03 PM' },
    { id: '5', sender: 'ai' as const, text: 'Excellent point about re-renders. How would you handle asynchronous actions, like API calls, within a Zustand store compared to Redux Thunk?', timestamp: '2:04 PM' },
    { id: '6', sender: 'candidate' as const, text: 'In Zustand, actions are just functions in the store, so you can just make them async. You await the fetch call inside the action and then call `set` with the new data. Its infinitely simpler than setting up Thunk middlewares.', timestamp: '2:05 PM' },
];

export default function TranscriptPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto h-[calc(100vh-6rem)]">
            <Link href={`${ROUTES.INTERVIEWS}/${params.id}`} className="inline-flex items-center text-sm text-brand-lavender hover:text-white transition-colors w-max">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Assessment
            </Link>

            <PageHeader
                title="Full Interview Transcript"
                description="Alex Harper • Senior Frontend Engineer"
            >
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                </Button>
            </PageHeader>

            <div className="flex-1 glass-card p-6 flex flex-col min-h-0">
                <TranscriptViewer messages={MOCK_TRANSCRIPT} />
            </div>
        </div>
    );
}
