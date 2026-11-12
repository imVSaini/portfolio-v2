import type { MetadataRoute } from "next";

import { caseStudies, caseStudiesPage } from "@/data/caseStudies";
import { posts } from "@/data/posts";
import { site } from "@/data/site";
import { getCaseStudyPath } from "@/lib/caseStudies";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}${caseStudiesPage.path}`, changeFrequency: "monthly", priority: 0.8 },
    ...caseStudies.map((study) => ({
      url: `${site.url}${getCaseStudyPath(study)}`,
      lastModified: study.date,
      priority: 0.7,
    })),
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      ...(post.updatedAt && { lastModified: post.updatedAt }),
      priority: 0.6,
    })),
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
