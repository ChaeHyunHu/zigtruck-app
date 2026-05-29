export function extractPathFromNotification(
  data: Record<string, unknown> | undefined,
): string | null {
  if (!data) return null;
  const url = (data.url ?? data.link ?? data.redirectUrl) as string | undefined;
  if (!url || typeof url !== "string") return null;
  return extractPathFromUrl(url);
}

export function extractPathFromUrl(url: string): string | null {
  if (url.startsWith("http")) {
    try {
      const parsed = new URL(url);
      const hash = parsed.hash?.replace(/^#/, "");
      const path = parsed.pathname || "/";
      return hash ? `${path}#${hash}` : path;
    } catch {
      return url;
    }
  }
  return url.startsWith("/") ? url : `/${url}`;
}

export function isZigtruckDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("zigtruck.io") || host.includes("zigtruck.kr");
  } catch {
    return false;
  }
}

function mapLicensePath(pathname: string): string | null {
  if (pathname === "/license") {
    return "/license";
  }
  if (pathname === "/license/my") {
    return "/license/my";
  }
  if (pathname === "/license/search") {
    return "/license/search";
  }
  if (pathname.startsWith("/license/purchase/guide")) {
    return "/license/purchase/guide";
  }
  if (pathname.startsWith("/license/purchase")) {
    return "/license/purchase/inquiry";
  }
  if (pathname.startsWith("/license/sales/guide")) {
    return "/license/sales/guide";
  }
  if (pathname.startsWith("/license/sales")) {
    return "/license/sales/inquiry";
  }
  if (pathname.startsWith("/license/form")) {
    return "/license/my";
  }
  if (pathname.startsWith("/license/")) {
    return "/license";
  }
  return null;
}

export function mapWebPathToAppRoute(path: string): string | null {
  const [pathname, hashPart] = path.split("#");
  const hash = hashPart?.trim();

  const chattingMatch = pathname.match(/\/chatting\/room\/(\d+)/);
  if (chattingMatch?.[1]) {
    return `/chat/room/${chattingMatch[1]}`;
  }
  if (pathname.startsWith("/chat/room/")) {
    return pathname;
  }

  const productEditMatch = pathname.match(/\/products\/sales\/edit\/(\d+)/);
  if (productEditMatch?.[1]) {
    return hash === "price"
      ? `/product/edit/${productEditMatch[1]}?tab=price`
      : `/product/edit/${productEditMatch[1]}`;
  }

  if (pathname.startsWith("/products/my")) {
    return "/(tabs)/manage";
  }

  const productMatch =
    pathname.match(/\/products\/(\d+)/) ?? pathname.match(/\/product\/(\d+)/);
  if (productMatch?.[1]) {
    return `/product/${productMatch[1]}`;
  }

  if (pathname.includes("/notification")) {
    if (hash === "interest") {
      return "/notifications?tab=interest";
    }
    return "/notifications?tab=activity";
  }

  const licenseRoute = mapLicensePath(pathname);
  if (licenseRoute) {
    return licenseRoute;
  }

  if (pathname.startsWith("/sell-car") || pathname.startsWith("/products/sales")) {
    return "/sell-car";
  }

  if (pathname.startsWith("/drive")) {
    return "/drive";
  }

  if (pathname.startsWith("/interest")) {
    return "/interest";
  }

  if (pathname.startsWith("/contract")) {
    return "/contract";
  }

  const jobMatch = pathname.match(/^\/job\/(\d+)/);
  if (jobMatch?.[1]) {
    return `/job/${jobMatch[1]}`;
  }
  if (pathname.startsWith("/job")) {
    return "/job";
  }

  const noticeMatch = pathname.match(/^\/notice\/(\d+)/);
  if (noticeMatch?.[1]) {
    return `/notice/${noticeMatch[1]}`;
  }
  if (pathname.startsWith("/notice")) {
    return "/notice";
  }

  if (
    pathname.startsWith("/setting/notification") ||
    pathname === "/notification-settings"
  ) {
    return "/notification-settings";
  }
  if (pathname.startsWith("/settings") || pathname.startsWith("/setting")) {
    return "/settings";
  }

  if (pathname.includes("/manage") || pathname.startsWith("/my-products")) {
    return "/(tabs)/manage";
  }

  if (pathname === "/" || pathname === "/home") {
    return "/(tabs)";
  }

  return null;
}

/** zigtruckapp://push?url=... (네이티브 알림 탭) */
export function resolveRouteFromPushDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    const isPushHost =
      parsed.hostname === "push" || parsed.pathname.replace(/^\//, "") === "push";
    if (!isPushHost) {
      return null;
    }

    const target = parsed.searchParams.get("url");
    if (!target) {
      return "/(tabs)";
    }

    const decoded = decodeURIComponent(target);
    const path = extractPathFromUrl(decoded);
    if (!path) {
      return null;
    }
    return mapWebPathToAppRoute(path);
  } catch {
    return null;
  }
}
