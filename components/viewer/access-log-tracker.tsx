"use client";

import { useEffect, useRef } from "react";
import { recordAccessLog } from "@/lib/actions/access-log";

type AccessLogTrackerProps = {
  pageType: string;
  contentId?: string | null;
  contentTitle?: string | null;
};

export function AccessLogTracker({
  pageType,
  contentId = null,
  contentTitle = null,
}: AccessLogTrackerProps) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    void recordAccessLog({ pageType, contentId, contentTitle });
  }, [pageType, contentId, contentTitle]);

  return null;
}
