import { expect, test, type Page } from "@playwright/test";

import { blog } from "@/data/blog";
import { caseStudies, caseStudiesPage } from "@/data/caseStudies";
import { contact } from "@/data/contact";
import { posts } from "@/data/posts";
import { site } from "@/data/site";

import {
  getCanonical,
  getCaseStudyPath,
  getFirstCaseStudy,
  getFirstPost,
  getPostPath,
  PAGE_ROUTES,
} from "../routes";

type Node = Record<string, unknown>;

const PERSON_ID = `${site.url}/#person`;
const WEBSITE_ID = `${site.url}/#website`;
const BLOG_ID = `${site.url}/blog#blog`;
const BLOG_URL = `${site.url}/blog`;
const CASE_STUDIES_URL = getCanonical(caseStudiesPage.path);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNodes(value: unknown): Node[] {
  return Array.isArray(value) ? value.filter(isNode) : [];
}

async function readGraph(page: Page): Promise<Node[]> {
  const script = page.locator('script[type="application/ld+json"]');
  await expect(script).toHaveCount(1);

  const source = (await script.textContent()) ?? "";
  expect(source, "markup inside the script must stay escaped").not.toContain("<");

  const parsed: unknown = JSON.parse(source);
  if (!isNode(parsed)) throw new Error("The structured data is not a JSON object");
  expect(parsed["@context"]).toBe("https://schema.org");
  return toNodes(parsed["@graph"]);
}

function getTypes(graph: Node[]): unknown[] {
  return graph.map((node) => node["@type"]);
}

function findNode(graph: Node[], type: string): Node {
  const node = graph.find((item) => item["@type"] === type);
  if (!node) throw new Error(`The graph has no ${type} node`);
  return node;
}

function collectReferences(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectReferences);
  if (!isNode(value)) return [];
  const id = value["@id"];
  if (Object.keys(value).length === 1 && typeof id === "string") return [id];
  return Object.values(value).flatMap(collectReferences);
}

function expectSiteNodes(graph: Node[]): void {
  expect(findNode(graph, "Person")).toEqual({
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    alternateName: site.fullName,
    url: site.url,
    jobTitle: site.role,
    sameAs: contact.links.map((link) => link.href),
  });
  expect(findNode(graph, "WebSite")).toEqual({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: "en-IN",
    publisher: { "@id": PERSON_ID },
  });
}

test.describe("structured data", () => {
  test("the home page describes the person, the site and the page", async ({ page }) => {
    await page.goto("/");
    const graph = await readGraph(page);

    expect(getTypes(graph)).toEqual(["Person", "WebSite", "WebPage"]);
    expectSiteNodes(graph);
    expect(findNode(graph, "WebPage")).toEqual({
      "@type": "WebPage",
      "@id": site.url,
      url: site.url,
      name: `${site.name} — ${site.role}`,
      description: site.description,
      inLanguage: "en-IN",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
    });
  });

  test("the blog index describes the collection and lists every post", async ({ page }) => {
    await page.goto("/blog");
    const graph = await readGraph(page);
    const collection = findNode(graph, "CollectionPage");
    const blogNode = findNode(graph, "Blog");
    const listed = toNodes(blogNode["blogPost"]);

    expect(getTypes(graph)).toEqual([
      "Person",
      "WebSite",
      "CollectionPage",
      "BreadcrumbList",
      "Blog",
    ]);
    expectSiteNodes(graph);
    expect(collection).toMatchObject({
      "@id": BLOG_URL,
      url: BLOG_URL,
      name: `${blog.title} — ${site.name}`,
      description: blog.description,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": BLOG_ID },
      breadcrumb: { "@id": `${BLOG_URL}#breadcrumb` },
    });
    expect(blogNode).toMatchObject({
      "@id": BLOG_ID,
      url: BLOG_URL,
      description: blog.description,
      inLanguage: "en-IN",
      publisher: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
    });
    expect(findNode(graph, "BreadcrumbList")["itemListElement"]).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: blog.title, item: BLOG_URL },
    ]);
    expect(listed.map((node) => node["headline"])).toEqual(posts.map((post) => post.title));
    expect(listed.map((node) => node["url"])).toEqual(
      posts.map((post) => getCanonical(getPostPath(post))),
    );
    expect(listed.every((node) => node["@type"] === "BlogPosting")).toBe(true);
  });

  for (const post of posts) {
    test(`${getPostPath(post)} describes the article and its breadcrumb`, async ({ page }) => {
      const url = getCanonical(getPostPath(post));
      await page.goto(getPostPath(post));
      const graph = await readGraph(page);
      const article = findNode(graph, "BlogPosting");

      expect(getTypes(graph)).toEqual([
        "Person",
        "WebSite",
        "Blog",
        "WebPage",
        "BreadcrumbList",
        "BlogPosting",
      ]);
      expectSiteNodes(graph);
      expect(article).toMatchObject({
        "@id": `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        articleSection: post.topic,
        inLanguage: "en-IN",
        url,
        mainEntityOfPage: { "@id": url },
        author: { "@type": "Person", "@id": PERSON_ID, name: site.name, url: site.url },
        publisher: { "@id": PERSON_ID },
        isPartOf: { "@id": BLOG_ID },
      });
      expect(article["datePublished"]).toMatch(ISO_DATE);
      expect(article["image"]).toMatch(/^https:\/\/\S+$/);
      expect("dateModified" in article).toBe(Boolean(post.updatedAt));
      expect(findNode(graph, "WebPage")).toMatchObject({
        "@id": url,
        url,
        name: post.title,
        description: post.excerpt,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": `${url}#article` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: { "@type": "ImageObject", url: article["image"] },
      });
      expect(findNode(graph, "BreadcrumbList")).toEqual({
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: blog.title, item: BLOG_URL },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      });
    });
  }

  test("the case studies index describes the collection and lists every study", async ({
    page,
  }) => {
    await page.goto(caseStudiesPage.path);
    const graph = await readGraph(page);

    expect(getTypes(graph)).toEqual([
      "Person",
      "WebSite",
      "CollectionPage",
      "BreadcrumbList",
      "ItemList",
    ]);
    expectSiteNodes(graph);
    expect(findNode(graph, "CollectionPage")).toMatchObject({
      "@id": CASE_STUDIES_URL,
      url: CASE_STUDIES_URL,
      name: `${caseStudiesPage.title} — ${site.name}`,
      description: caseStudiesPage.description,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": `${CASE_STUDIES_URL}#list` },
      breadcrumb: { "@id": `${CASE_STUDIES_URL}#breadcrumb` },
    });
    expect(findNode(graph, "BreadcrumbList")["itemListElement"]).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: caseStudiesPage.title, item: CASE_STUDIES_URL },
    ]);
    expect(findNode(graph, "ItemList")).toEqual({
      "@type": "ItemList",
      "@id": `${CASE_STUDIES_URL}#list`,
      itemListElement: caseStudies.map((study, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: study.title,
        url: getCanonical(getCaseStudyPath(study)),
      })),
    });
  });

  for (const study of caseStudies) {
    const path = getCaseStudyPath(study);

    test(`${path} describes the article and its breadcrumb`, async ({ page }) => {
      const url = getCanonical(path);
      const image = `${url}/opengraph-image/card`;
      await page.goto(path);
      const graph = await readGraph(page);

      expect(getTypes(graph)).toEqual([
        "Person",
        "WebSite",
        "WebPage",
        "BreadcrumbList",
        "Article",
      ]);
      expectSiteNodes(graph);
      expect(findNode(graph, "Article")).toEqual({
        "@type": "Article",
        "@id": `${url}#article`,
        headline: `${study.title} case study`,
        description: study.summary,
        image,
        datePublished: study.date,
        articleSection: study.category,
        keywords: study.stack.join(", "),
        inLanguage: "en-IN",
        url,
        mainEntityOfPage: { "@id": url },
        author: { "@type": "Person", "@id": PERSON_ID, name: site.name, url: site.url },
        publisher: { "@id": PERSON_ID },
      });
      expect(study.date).toMatch(ISO_DATE);
      expect(findNode(graph, "WebPage")).toMatchObject({
        "@id": url,
        url,
        name: `${study.title} case study`,
        description: study.summary,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": `${url}#article` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: { "@type": "ImageObject", url: image },
      });
      expect(findNode(graph, "BreadcrumbList")).toEqual({
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: caseStudiesPage.title, item: CASE_STUDIES_URL },
          { "@type": "ListItem", position: 3, name: study.title, item: url },
        ],
      });
    });
  }

  test("every reference points at a node in the graph or a page of the site", async ({ page }) => {
    const pages = PAGE_ROUTES.map(getCanonical);

    for (const path of [
      "/",
      "/blog",
      getPostPath(getFirstPost()),
      caseStudiesPage.path,
      getCaseStudyPath(getFirstCaseStudy()),
    ]) {
      await page.goto(path);
      const graph = await readGraph(page);
      const known = new Set([...graph.map((node) => node["@id"]), ...pages]);
      const ids = graph.map((node) => node["@id"]);

      expect(new Set(ids).size, `${path} repeats an @id`).toBe(ids.length);
      for (const reference of collectReferences(graph)) {
        expect(known.has(reference), `${path} → ${reference}`).toBe(true);
      }
    }
  });

  test("the article image in the graph is the page's preview card", async ({ page, request }) => {
    await page.goto(getPostPath(getFirstPost()));
    const image = findNode(await readGraph(page), "BlogPosting")["image"];
    if (typeof image !== "string") throw new Error("The article has no image URL");

    const response = await request.get(new URL(image).pathname);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  for (const path of ["/privacy", "/nope"]) {
    test(`${path} carries no structured data`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    });
  }
});
