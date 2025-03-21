'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function RedirectContent() {
    const router = useRouter();

    useEffect(() => {
        router.push('/not-found');
    }, [router]);

    return null;
}

export default function NotFoundPage() {
    return (
        <Suspense fallback={<div>Redirecting...</div>}>
            <RedirectContent />
        </Suspense>
    );
} 