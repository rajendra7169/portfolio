import { Suspense } from "react";
import Home from "@/components/stories/Home";
import { Loading } from "@/components/stories/ui";

export default function StoriesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  );
}
