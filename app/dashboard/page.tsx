import { LinkList } from '@/components/dashboard/LinkList';

export default function DashboardPage() {
  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" id="page-heading">
          Your Links
        </h1>
        <p className="text-slate-600">Manage and track your short links</p>
      </div>
      <LinkList />
    </div>
  );
}

