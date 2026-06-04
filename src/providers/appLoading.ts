export type AppLoadingOptions = {
  message?: string;
};

type AppLoadingHandlers = {
  show: (options?: AppLoadingOptions) => void;
  hide: () => void;
};

let handlers: AppLoadingHandlers | null = null;

export function registerAppLoading(next: AppLoadingHandlers | null) {
  handlers = next;
}

export function showAppLoading(options?: AppLoadingOptions) {
  handlers?.show(options);
}

export function hideAppLoading() {
  handlers?.hide();
}
