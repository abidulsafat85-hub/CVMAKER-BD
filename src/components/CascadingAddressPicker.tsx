import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { AddressBlock } from '../types/cv';
import { Language, TRANSLATIONS } from '../data/translations';
import { MapPin } from 'lucide-react';

interface CascadingAddressPickerProps {
  label: string;
  value: AddressBlock;
  onChange: (updated: AddressBlock) => void;
  lang: Language;
  disabled?: boolean;
}

export function formatFullAddress(addr: AddressBlock): string {
  if (!addr || !addr.country) return '';
  const parts: string[] = [];
  if (addr.thanaCity) parts.push(addr.thanaCity);
  if (addr.district) parts.push(addr.district);
  if (addr.divisionState) parts.push(addr.divisionState);
  if (addr.country) parts.push(addr.country);

  const cascade = parts.join(', ');
  if (addr.streetRoadPostCode?.trim()) {
    return `${addr.streetRoadPostCode.trim()}, ${cascade}`;
  }
  return cascade;
}

interface BdDivisionItem {
  en: string;
  bn: string;
  districts: {
    en: string;
    bn: string;
    thanas: { en: string; bn: string }[];
  }[];
}

let cachedBdDivisions: BdDivisionItem[] | null = null;
let cscModule: typeof import('country-state-city') | null = null;

const DEFAULT_POPULAR_COUNTRIES = [
  { name: 'Bangladesh', isoCode: 'BD' },
  { name: 'United States', isoCode: 'US' },
  { name: 'United Kingdom', isoCode: 'GB' },
  { name: 'Canada', isoCode: 'CA' },
  { name: 'Australia', isoCode: 'AU' },
  { name: 'United Arab Emirates', isoCode: 'AE' },
  { name: 'Saudi Arabia', isoCode: 'SA' },
  { name: 'India', isoCode: 'IN' },
  { name: 'Germany', isoCode: 'DE' },
  { name: 'Malaysia', isoCode: 'MY' },
];

const CascadingAddressPickerComponent: React.FC<CascadingAddressPickerProps> = ({
  label,
  value,
  onChange,
  lang,
  disabled = false,
}) => {
  const t = TRANSLATIONS[lang];
  const isBN = value.country === 'Bangladesh' || value.country === 'বাংলাদেশ';

  const [bdDivisionsData, setBdDivisionsData] = useState<BdDivisionItem[]>(() => cachedBdDivisions || []);
  const [csc, setCsc] = useState<typeof import('country-state-city') | null>(() => cscModule);

  // Lazy load Bangladesh Geo data on mount
  useEffect(() => {
    if (cachedBdDivisions) {
      setBdDivisionsData(cachedBdDivisions);
    } else {
      import('../data/bangladeshGeo').then((mod) => {
        cachedBdDivisions = mod.BANGLADESH_DIVISIONS;
        setBdDivisionsData(mod.BANGLADESH_DIVISIONS);
      });
    }
  }, []);

  // Lazy load country-state-city if country is not Bangladesh or on demand
  const loadCSC = useCallback(() => {
    if (cscModule) {
      setCsc(cscModule);
      return;
    }
    import('country-state-city').then((mod) => {
      cscModule = mod;
      setCsc(mod);
    });
  }, []);

  useEffect(() => {
    if (!isBN) {
      loadCSC();
    }
  }, [isBN, loadCSC]);

  // All countries list with Bangladesh first
  const allCountries = useMemo(() => {
    if (csc) {
      const list = csc.Country.getAllCountries().map((c) => ({
        name: c.name,
        isoCode: c.isoCode,
      }));
      const bdIndex = list.findIndex((c) => c.isoCode === 'BD' || c.name === 'Bangladesh');
      if (bdIndex > -1) {
        const [bd] = list.splice(bdIndex, 1);
        return [bd, ...list];
      }
      return list;
    }

    // Default fast initial country list
    if (value.country && !DEFAULT_POPULAR_COUNTRIES.some((c) => c.name === value.country)) {
      return [...DEFAULT_POPULAR_COUNTRIES, { name: value.country, isoCode: '' }];
    }
    return DEFAULT_POPULAR_COUNTRIES;
  }, [csc, value.country]);

  const selectedCountryObj = useMemo(() => {
    return allCountries.find((c) => c.name === value.country);
  }, [allCountries, value.country]);

  // Bangladesh offline divisions
  const bdDivisions = useMemo(() => {
    return bdDivisionsData.map((d) => ({
      en: d.en,
      bn: d.bn,
      label: lang === 'bn' ? d.bn : d.en,
      value: d.en,
    }));
  }, [bdDivisionsData, lang]);

  // Bangladesh offline districts
  const bdDistricts = useMemo(() => {
    if (!isBN || !value.divisionState) return [];
    const div = bdDivisionsData.find(
      (d) => d.en.toLowerCase() === value.divisionState.toLowerCase()
    );
    if (!div) return [];
    return div.districts.map((dist) => ({
      en: dist.en,
      bn: dist.bn,
      label: lang === 'bn' ? dist.bn : dist.en,
      value: dist.en,
    }));
  }, [isBN, value.divisionState, bdDivisionsData, lang]);

  // Bangladesh offline thanas
  const bdThanas = useMemo(() => {
    if (!isBN || !value.divisionState || !value.district) return [];
    const div = bdDivisionsData.find(
      (d) => d.en.toLowerCase() === value.divisionState.toLowerCase()
    );
    if (!div) return [];
    const dist = div.districts.find(
      (d) => d.en.toLowerCase() === value.district.toLowerCase()
    );
    if (!dist) return [];
    return dist.thanas.map((th) => ({
      en: th.en,
      bn: th.bn,
      label: lang === 'bn' ? th.bn : th.en,
      value: th.en,
    }));
  }, [isBN, value.divisionState, value.district, bdDivisionsData, lang]);

  // Other countries states & cities via country-state-city
  const foreignStates = useMemo(() => {
    if (isBN || !selectedCountryObj || !csc || !selectedCountryObj.isoCode) return [];
    return csc.State.getStatesOfCountry(selectedCountryObj.isoCode).map((s) => ({
      name: s.name,
      isoCode: s.isoCode,
    }));
  }, [isBN, selectedCountryObj, csc]);

  const foreignStateObj = useMemo(() => {
    if (!foreignStates.length) return null;
    return foreignStates.find((s) => s.name === value.divisionState);
  }, [foreignStates, value.divisionState]);

  const foreignCities = useMemo(() => {
    if (isBN || !selectedCountryObj || !foreignStateObj || !csc || !selectedCountryObj.isoCode) return [];
    return csc.City.getCitiesOfState(selectedCountryObj.isoCode, foreignStateObj.isoCode).map(
      (c) => c.name
    );
  }, [isBN, selectedCountryObj, foreignStateObj, csc]);

  // Handlers with parent-to-child reset
  const handleCountryChange = (newCountry: string) => {
    onChange({
      country: newCountry,
      divisionState: '',
      district: '',
      thanaCity: '',
      streetRoadPostCode: value.streetRoadPostCode,
    });
  };

  const handleDivisionChange = (newDivision: string) => {
    onChange({
      ...value,
      divisionState: newDivision,
      district: '',
      thanaCity: '',
    });
  };

  const handleDistrictChange = (newDistrict: string) => {
    onChange({
      ...value,
      district: newDistrict,
      thanaCity: '',
    });
  };

  const handleThanaChange = (newThana: string) => {
    onChange({
      ...value,
      thanaCity: newThana,
    });
  };

  const handleStreetChange = (newStreet: string) => {
    onChange({
      ...value,
      streetRoadPostCode: newStreet,
    });
  };

  return (
    <div className="space-y-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/70">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>{label}</span>
        </label>
        {isBN && (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {lang === 'bn' ? 'বাংলাদেশ (অফলাইন জেলা-থানা)' : 'Bangladesh (Instant BD Selector)'}
          </span>
        )}
      </div>

      {/* Street / Road / House / Village / Post Office */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          {t.streetLine}
        </label>
        <input
          type="text"
          disabled={disabled}
          value={value.streetRoadPostCode || ''}
          onChange={(e) => handleStreetChange(e.target.value)}
          placeholder={
            lang === 'bn'
              ? 'বাড়ি #১২, রোড #৪, গ্রাম/এলাকা, পোস্ট কোড'
              : 'House #12, Road #4, Area, Post Code'
          }
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden transition shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
        />
      </div>

      {/* Row 1: Country & Division/State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Country */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {t.country}
          </label>
          <select
            disabled={disabled}
            value={value.country || 'Bangladesh'}
            onFocus={loadCSC}
            onMouseEnter={loadCSC}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden transition disabled:bg-slate-100"
          >
            {allCountries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name === 'Bangladesh' && lang === 'bn' ? 'বাংলাদেশ (Bangladesh)' : c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Division / State */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {t.division}
          </label>
          {isBN ? (
            <select
              disabled={disabled}
              value={value.divisionState}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
            >
              <option value="">-- {t.division} --</option>
              {bdDivisions.map((div) => (
                <option key={div.value} value={div.value}>
                  {div.label}
                </option>
              ))}
            </select>
          ) : foreignStates.length > 0 ? (
            <select
              disabled={disabled}
              value={value.divisionState}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
            >
              <option value="">-- {t.division} --</option>
              {foreignStates.map((st) => (
                <option key={st.isoCode || st.name} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              disabled={disabled}
              value={value.divisionState}
              onChange={(e) => handleDivisionChange(e.target.value)}
              placeholder="State / Province"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
            />
          )}
        </div>
      </div>

      {/* Row 2: District & Thana/City (Dynamic Cascading) */}
      {value.divisionState && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 animate-in fade-in">
          {/* District */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.district}
            </label>
            {isBN ? (
              <select
                disabled={disabled || !value.divisionState}
                value={value.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
              >
                <option value="">-- {t.district} --</option>
                {bdDistricts.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled={disabled || !value.divisionState}
                value={value.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                placeholder="District / County"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
              />
            )}
          </div>

          {/* Thana / City */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.thana}
            </label>
            {isBN ? (
              <select
                disabled={disabled || !value.district}
                value={value.thanaCity}
                onChange={(e) => handleThanaChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
              >
                <option value="">-- {t.thana} --</option>
                {bdThanas.map((th) => (
                  <option key={th.value} value={th.value}>
                    {th.label}
                  </option>
                ))}
              </select>
            ) : foreignCities.length > 0 ? (
              <select
                disabled={disabled || !value.divisionState}
                value={value.thanaCity}
                onChange={(e) => handleThanaChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
              >
                <option value="">-- {t.thana} --</option>
                {foreignCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled={disabled || !value.divisionState}
                value={value.thanaCity}
                onChange={(e) => handleThanaChange(e.target.value)}
                placeholder="City / Thana"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CascadingAddressPicker = React.memo(CascadingAddressPickerComponent);
