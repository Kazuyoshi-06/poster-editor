import EditorLayout from '../components/EditorLayout';

interface EditorProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorProjectPage({ params }: EditorProjectPageProps) {
  const { id } = await params;
  return <EditorLayout projectId={id} />;
}
