const dirtyDetailIds = new Set<number>();
let purchaseListDirty = false;

export const invalidateProductCaches = (productId?: number) => {
  if (productId != null && Number.isFinite(Number(productId))) {
    dirtyDetailIds.add(Number(productId));
  }
  purchaseListDirty = true;
};

export const consumePurchaseListDirty = () => {
  const dirty = purchaseListDirty;
  purchaseListDirty = false;
  return dirty;
};

export const peekPurchaseListDirty = () => purchaseListDirty;

export const shouldRefreshProductDetail = (productId: string | number) => {
  const id = Number(productId);
  if (!Number.isFinite(id)) return false;
  if (!dirtyDetailIds.has(id)) return false;
  dirtyDetailIds.delete(id);
  return true;
};

export const markProductDetailDirty = (productId: string | number) => {
  const id = Number(productId);
  if (Number.isFinite(id)) dirtyDetailIds.add(id);
};
