export function generateStaticParams() {
    return [];
}

import ClientPage from "./ClientPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return <ClientPage params={params} />;
}
