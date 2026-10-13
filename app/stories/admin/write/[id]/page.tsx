import Writer from "@/components/stories/admin/Writer";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Writer id={decodeURIComponent(id)} />;
}
