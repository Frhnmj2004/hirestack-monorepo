'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ReportExportButton() {
    const handleExport = () => {
        // Generate PDF logic would go here
        console.log("Exporting report as PDF...");
    };

    return (
        <Button
            onClick={handleExport}
            className="bg-brand-violet hover:bg-brand-violet/80 text-white border-none shadow-glow-sm"
        >
            <Download className="w-4 h-4 mr-2" />
            Export Full Report
        </Button>
    );
}
