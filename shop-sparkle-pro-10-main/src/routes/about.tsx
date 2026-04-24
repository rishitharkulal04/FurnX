import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — furnX" },
      { name: "description", content: "furnX crafts beautifully designed furniture for the modern home." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold">About furnX</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        furnX designs and curates beautifully crafted furniture for the modern home —
        warm materials, honest construction, and timeless silhouettes that get better with age.
      </p>
      <p className="mt-4 text-muted-foreground">
        Every piece is chosen for character and built to last. From the linen of our sofas to the
        oak of our dining tables, we work with makers who share our love of natural materials.
      </p>
    </div>
  );
}
