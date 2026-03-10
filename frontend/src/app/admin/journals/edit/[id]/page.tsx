export function generateStaticParams() {
    return [];
}

import ClientPage from "./ClientPage";

export default function Page(props: any) {
    return <ClientPage {...props} />;
}
