import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to SMB dashboard by default
  redirect('/dashboard/smb');
}
