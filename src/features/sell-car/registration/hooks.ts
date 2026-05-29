import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import { fetchRegistrationProduct } from "@/src/api/products/carRegister";
import { patchProducts } from "@/src/api/public";
import { normalizeCarRegisterResponse } from "@/src/features/sell-car/registration/productUtils";
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
      .catch(() => Alert.alert("오류", "차량 정보를 불러오지 못했습니다."))
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
        setProductFormData((prev) => ({ ...(prev ?? {}), ...data, id: request.id }));
        return data;
      } finally {
        setSaving(false);
      }
    },
    [setProductFormData],
  );

  return { patch, saving };
};
