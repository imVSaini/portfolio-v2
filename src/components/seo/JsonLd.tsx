import { serializeJsonLd, type JsonLdNode } from "@/lib/jsonLd";

type JsonLdProps = {
  nodes: readonly JsonLdNode[];
};

export function JsonLd({ nodes }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(nodes) }}
    />
  );
}
