import NotificationList from '@/components/notifications/NotificationList'

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen">
            <header className="border-b lg:pl-64">
                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between">
                    <h1 className="text-xl font-bold">Team App</h1>
                    <NotificationList />
                </div>
            </header>
            <main className="py-6">
                {children}
            </main>
        </div>
    )
}
