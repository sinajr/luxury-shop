
import { AdvisorForm } from '@/components/advisor/advisor-form';

interface AdvisorPageProps {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function AdvisorPage({ params, searchParams }: AdvisorPageProps) {
  return (
    <div className="container mx-auto py-8">
      <AdvisorForm />
    </div>
  );
}
