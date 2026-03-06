import { PageHeader } from '@/components/layout/PageHeader';
import { JobRoleForm } from '@/components/features/job-roles/JobRoleForm';

export default function CreateJobRolePage() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <PageHeader
                title="Create Job Role"
                description="Define a new position to start generating intelligent resume shortlists and AI interview campaigns."
            />
            <JobRoleForm />
        </div>
    );
}
