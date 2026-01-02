import { Head } from '@inertiajs/react';
import DocsLayout from '@/layouts/DocsLayout';

interface Props {
    content: string;
    title: string;
    slug: string;
    menu: any[];
}

export default function Index({ content, title, slug, menu }: Props) {
    return (
        <DocsLayout menu={menu}>
            <Head title={`${title} - KasPOS Docs`} />
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </DocsLayout>
    );
}
