
import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const Pageheader = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const titleMap = {
    "dashboard": t("page_titles.dashboard"),
    "home": t("page_titles.home"),
    "orders": t("page_titles.orders"),
    "products": t("page_titles.products"),
    "ads": t("page_titles.ads"),
    "additional-values": t("page_titles.additional_values"),
    "integrations": t("page_titles.integrations"),
    "precification": t("page_titles.pricing_spreadsheet"),
    "profile": t("page_titles.my_profile"),
    "plan-management":  t("page_titles.plan_management"),
    "personal-data":  t("page_titles.personal_data"),
    "update-password":  t("page_titles.password_change"),
    "store-management":  t("page_titles.store_management"),
    "users":  t("page_titles.users"),
    "plans":  t("page_titles.plans"),
    "plans-benefits":  t("page_titles.plans_benefits"),
    "clients":  t("page_titles.clients"),
    "homeadmin":  t("page_titles.home"),
    // Adicione mais mapeamentos conforme necessário
  };


  const locationArray = pathname.split("/").filter(Boolean);
  const currentRoute = locationArray[0];
  const pageTitle = titleMap[currentRoute] || currentRoute;

  return (
    <Fragment>
      <div className="d-sm-flex d-block align-items-center justify-content-between page-header-breadcrumb">
        <h4 className="fw-medium mb-0">{pageTitle}</h4>
      </div>
    </Fragment>
  );
};

export default Pageheader;
