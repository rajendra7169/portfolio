import AuthorPage from "@/components/stories/AuthorPage";

export default async function Author({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <AuthorPage username={decodeURIComponent(username)} />;
}
