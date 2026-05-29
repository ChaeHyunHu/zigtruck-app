import { useEffect, useState } from "react";

const formatValueToDecimalPlaces = (value: string, decimalPlaces: number) => {
  const cleanedValue = String(value).replace(/[^\d.]/g, "");
  if (cleanedValue.includes(".")) {
    const parts = cleanedValue.split(".");
    return `${parts[0]}.${parts[1].slice(0, decimalPlaces)}`;
  }
  return cleanedValue;
};

type LoanCalculatorState = {
  principal: string;
  loanTerm: string;
  interestRate: string;
  monthlyPayment: string;
};

export const useLoanCalculator = (
  initialPrice: number,
  initialInterestRate = "6.1",
  initialLoanTerm = "60",
) => {
  const [loanCalculatorState, setLoanCalculatorState] = useState<LoanCalculatorState>({
    principal: initialPrice ? String(initialPrice * 10000) : "0",
    loanTerm: initialLoanTerm,
    interestRate: initialInterestRate,
    monthlyPayment: "0",
  });

  useEffect(() => {
    setLoanCalculatorState((prev) => ({
      ...prev,
      principal: initialPrice ? String(initialPrice * 10000) : "0",
    }));
  }, [initialPrice]);

  const handleInputChange = (name: keyof LoanCalculatorState, value: string) => {
    const convertedValue = value.replace(/[^0-9.]/g, "");
    if (convertedValue.startsWith(".")) return;

    const formattedValue =
      name === "interestRate"
        ? formatValueToDecimalPlaces(convertedValue, 2)
        : convertedValue;

    setLoanCalculatorState((prevState) => ({
      ...prevState,
      [name]: formattedValue,
    }));
  };

  const handleInputBlur = (name: keyof LoanCalculatorState) => {
    setLoanCalculatorState((prevState) => {
      const updatedValue = prevState[name].replace(/^0+(?=\d)/, "");
      return {
        ...prevState,
        [name]: updatedValue || "0",
      };
    });
  };

  useEffect(() => {
    const { principal, loanTerm, interestRate } = loanCalculatorState;
    if (!principal || !loanTerm) {
      setLoanCalculatorState((prevState) => ({
        ...prevState,
        monthlyPayment: "0",
      }));
      return;
    }

    const loanAmount = Number(principal);
    const term = Number(loanTerm);
    let payment = 0;

    if (interestRate && Number(interestRate) > 0) {
      const monthlyInterestRate = Number(interestRate) / 12 / 100;
      payment =
        loanAmount *
        (monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -term)));
    } else {
      payment = loanAmount / term;
    }

    setLoanCalculatorState((prevState) => ({
      ...prevState,
      monthlyPayment: payment ? payment.toFixed(0) : "0",
    }));
  }, [
    loanCalculatorState.principal,
    loanCalculatorState.loanTerm,
    loanCalculatorState.interestRate,
  ]);

  return {
    loanCalculatorState,
    handleInputChange,
    handleInputBlur,
  };
};
