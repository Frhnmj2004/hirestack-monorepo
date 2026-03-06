import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
            <PageHeader
                title="Settings & Preferences"
                description="Manage your account, API keys, and notification preferences."
            />

            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80">First Name</label>
                        <input type="text" defaultValue="Admin" className="input-dark px-4 py-2 rounded-lg" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80">Last Name</label>
                        <input type="text" defaultValue="User" className="input-dark px-4 py-2 rounded-lg" />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-medium text-white/80">Email Address</label>
                        <input type="email" defaultValue="admin@hirelens.ai" className="input-dark px-4 py-2 rounded-lg" />
                    </div>
                </div>
                <div className="mt-6">
                    <Button className="bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm">
                        Save Profile
                    </Button>
                </div>
            </div>

            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">API Configurations</h3>
                <div className="space-y-6 max-w-2xl">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80">OpenAI API Key</label>
                        <input type="password" defaultValue="sk-........................" className="input-dark px-4 py-2 rounded-lg font-mono" />
                        <p className="text-xs text-white/40">Required for resume parsing and AI interviews.</p>
                    </div>
                </div>
                <div className="mt-6">
                    <Button className="bg-white/10 hover:bg-white/20 text-white border-transparent">
                        Update API Keys
                    </Button>
                </div>
            </div>
        </div>
    );
}
