import { useCallback, useEffect, useState } from "react";

import { fetchRegistrationProduct } from "@/src/api/products/carRegister";
import { patchProducts } from "@/src/api/public";
import { normalizeCarRegisterResponse } from "@/src/features/sell-car/registration/productUtils";
import { showAppAlert } from "@/src/providers/appDialog";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

export const useRegistrationProduct = (id: string | undefined) => {
  const { productFormData, setProductFormData } = useProductRegistration();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (productFormData?.id === Number(id)) return;
    let mounted = true;
    setLoading(true);
    fetchRegistrationProduct(id)
      .then((data) => {
        if (!mounted) return;
        setProductFormData(normalizeCarRegisterResponse(data));
      })
      .catch(() => showAppAlert({ title: "오류", message: "차량 정보를 불러오지 못했습니다." }))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, productFormData?.id, setProductFormData]);

  return { productFormData, setProductFormData, loading };
};

export const usePatchProduct = () => {
  const { setProductFormData } = useProductRegistration();
  const [saving, setSaving] = useState(false);

  const patch = useCallback(
    async (request: ProductRegisterRequest) => {
      setSaving(true);
      try {
        const res = await patchProducts(request);
        const data = res.data ?? res;
        setProductFormData((prev) => {
          const merged = { ...(prev ?? {}), ...data, id: request.id };
          // 번호판 정보(license)와 판매 여부(isSaleLicense)는 최종 등록 시점에만
          // 서버에 동기화된다. 중간 단계 patch 응답은 이 값을 false/null로 돌려보내
          // 로컬에 저장해둔 입력값을 덮어쓰므로, 해당 patch 요청이 직접 지정하지
          // 않은 경우에는 로컬 값을 그대로 유지한다.
          if (data?.license == null && prev?.license != null) {
            merged.license = prev.license;
          }
          const requestSetsSaleLicense =
            Object.prototype.hasOwnProperty.call(request, "isSaleLicense") &&
            (request as { isSaleLicense?: boolean }).isSaleLicense != null;
          if (!requestSetsSaleLicense && prev?.isSaleLicense != null) {
            merged.isSaleLicense = prev.isSaleLicense;
          }
          return merged;
        });
        return data;
      } finally {
        setSaving(false);
      }
    },
    [setProductFormData],
  );

  return { patch, saving };
};
