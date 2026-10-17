// Structured data for search engines (lib/seo.ts), as a JSON-LD script tag.
// "<" is escaped so no string in the data can ever close the tag early.
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
