import type { Metadata } from "next";
import PostPage from "@/components/stories/PostPage";

type Props = { params: Promise<{ slug: string }> };

// With Supabase connected, shared links get the post's own title, summary and photo.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return {};
  const { slug } = await params;
  try {
    const res = await fetch(`${url}/rest/v1/posts?select=title,subtitle,cover&status=eq.published&slug=eq.${encodeURIComponent(decodeURIComponent(slug))}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 300 },
    });
    const [post] = (await res.json()) as { title: string; subtitle: string; cover: string | null }[];
    if (!post) return {};
    return {
      title: post.title,
      description: post.subtitle || undefined,
      openGraph: { title: post.title, description: post.subtitle || undefined, type: "article", images: post.cover ? [post.cover] : undefined },
    };
  } catch {
    return {};
  }
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  return <PostPage slug={slug} />;
}
