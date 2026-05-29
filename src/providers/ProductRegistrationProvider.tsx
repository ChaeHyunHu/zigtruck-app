import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getProductEnum } from "@/src/api/products/carRegister";
import type {
  ProductEnumData,
  RegistrationProduct,
} from "@/src/features/sell-car/registration/types";

type ProductRegistrationContextValue = {
  productFormData: RegistrationProduct | null;
  salesType: string | undefined;
  productEnum: ProductEnumData | null;
  setProductFormData: React.Dispatch<React.SetStateAction<RegistrationProduct | null>>;
  setSalesType: (type: string | undefined) => void;
  resetRegistration: () => void;
};

const ProductRegistrationContext =
  createContext<ProductRegistrationContextValue | null>(null);

export function ProductRegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [productFormData, setProductFormData] =
    useState<RegistrationProduct | null>(null);
  const [salesType, setSalesType] = useState<string | undefined>();
  const [productEnum, setProductEnum] = useState<ProductEnumData | null>(null);

  useEffect(() => {
    getProductEnum()
      .then((data) => setProductEnum(data))
      .catch(() => {});
  }, []);

  const resetRegistration = useCallback(() => {
    setProductFormData(null);
    setSalesType(undefined);
  }, []);

  const value = useMemo(
    () => ({
      productFormData,
      salesType,
      productEnum,
      setProductFormData,
      setSalesType,
      resetRegistration,
    }),
    [productFormData, productEnum, resetRegistration, salesType],
  );

  return (
    <ProductRegistrationContext.Provider value={value}>
      {children}
    </ProductRegistrationContext.Provider>
  );
}

export const useProductRegistration = () => {
  const ctx = useContext(ProductRegistrationContext);
  if (!ctx) {
    throw new Error("useProductRegistration must be used within ProductRegistrationProvider");
  }
  return ctx;
};
