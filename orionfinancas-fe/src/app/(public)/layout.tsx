import { Header } from "@/components/layout/header/Header";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header variant="public" />
            {children}
        </>
    );
}
