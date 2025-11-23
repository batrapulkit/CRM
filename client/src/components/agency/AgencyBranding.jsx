import React from "react";
import { useBranding } from "@/contexts/BrandingContext";

export default function AgencyBranding() {
  const { company_name, logo_url, plan } = useBranding();

  return (
    <div className="flex items-center gap-3">
      {logo_url ? (
        <img src={logo_url} alt={company_name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
      ) : (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold text-lg">
            {company_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div>
        <h1 className="font-semibold text-slate-900 text-sm">{company_name}</h1>
        <p className="text-xs text-slate-500">{plan}</p>
      </div>
    </div>
  );
}
