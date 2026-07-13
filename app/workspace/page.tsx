import { Suspense } from "react";
import WorkspacePage from "@/components/workspace/WorkspacePage";

function WorkspaceFallback() {
  return (
    <div className="flex h-screen items-center justify-center text-sm text-mute">
      加载中...
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<WorkspaceFallback />}>
      <WorkspacePage />
    </Suspense>
  );
}
