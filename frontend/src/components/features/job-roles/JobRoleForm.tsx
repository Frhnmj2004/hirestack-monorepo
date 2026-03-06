'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobSchema } from '@/lib/validators';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

type JobFormValues = z.infer<typeof createJobSchema>;

export function JobRoleForm({ initialData }: { initialData?: JobFormValues }) {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JobFormValues>({
        resolver: zodResolver(createJobSchema),
        defaultValues: initialData || {
            title: '',
            department: '',
            location: '',
            description: '',
        }
    });

    const onSubmit = async (data: JobFormValues) => {
        // Simulate API call to React Query mutation
        console.log("Submitting job role data:", data);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push(ROUTES.JOB_ROLES);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 max-w-2xl mx-auto flex flex-col gap-6">

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Job Title</label>
                <input
                    {...register('title')}
                    className="input-dark px-4 py-2 rounded-lg"
                    placeholder="e.g. Senior Frontend Engineer"
                />
                {errors.title && <span className="text-red-400 text-xs">{errors.title.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/80">Department</label>
                    <input
                        {...register('department')}
                        className="input-dark px-4 py-2 rounded-lg"
                        placeholder="e.g. Engineering"
                    />
                    {errors.department && <span className="text-red-400 text-xs">{errors.department.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-white/80">Location</label>
                    <input
                        {...register('location')}
                        className="input-dark px-4 py-2 rounded-lg"
                        placeholder="e.g. Remote, NY"
                    />
                    {errors.location && <span className="text-red-400 text-xs">{errors.location.message}</span>}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/80">Job Description</label>
                <textarea
                    {...register('description')}
                    rows={6}
                    className="input-dark px-4 py-3 rounded-lg resize-none"
                    placeholder="Provide a detailed description of the role, responsibilities, and requirements. The AI will use this strictly for ranking candidates."
                />
                {errors.description && <span className="text-red-400 text-xs">{errors.description.message}</span>}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData ? 'Save Changes' : 'Create Job Role'}
                </Button>
            </div>
        </form>
    );
}
