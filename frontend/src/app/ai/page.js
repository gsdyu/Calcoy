import dynamic from 'next/dynamic';

const AiPage = dynamic(() => import('@/components/AI/AiPage'), { ssr: false });
const SharedLayout = dynamic(() => import('@/components/SharedLayout'), { ssr: false });

export default function Ai() {
    return (
        <SharedLayout>
            <AiPage />
        </SharedLayout>
    );
}
