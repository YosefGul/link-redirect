import { CreateLinkForm } from '@/components/dashboard/CreateLinkForm';

export default function NewLinkPage() {
  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" id="page-heading">
          Create New Link
        </h1>
        <p className="text-slate-600">Generate a short link for your URL</p>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200">
        <CreateLinkForm />
      </div>
    </div>
  );
}

