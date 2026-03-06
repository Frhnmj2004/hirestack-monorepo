import { PageHeader } from '@/components/layout/PageHeader';
import { JobRoleForm } from '@/components/features/job-roles/JobRoleForm';

export default function EditJobRolePage() {
    // Mock data for demonstration
    const mockInitialData = {
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'Remote',
        description: 'We are looking for an experienced Senior Frontend Engineer with deep expertise in React, Next.js, and modern CSS architecture to lead our core product team.',
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="Edit Job Role"
                description="Update role details. Changes will not affect candidates already processed."
            />
            <JobRoleForm initialData={mockInitialData} />
        </div>
    );
}
