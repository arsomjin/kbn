import React from "react";
import { Card } from "antd";
import { useTranslation } from "react-i18next";

const DailyBankDeposit: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="text-center p-8">
        {t("income:dailyBankDeposit.title", "Daily Bank Deposit")}
      </div>
    </Card>
  );
};

export default DailyBankDeposit; 