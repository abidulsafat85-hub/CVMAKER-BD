import React, { useMemo } from 'react';
import { AddressBlock } from '../types/cv';
import { BANGLADESH_DIVISIONS } from '../data/bangladeshGeo';
import { Country, State, City } from 'country-state-city';
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

export const CascadingAddressPicker: React.FC<CascadingAddressPickerProps> = ({
  label,
  value,
  onChange,
  lang,
  disabled = false,
}) => {
  const t = TRANSLATIONS[lang];
  const isBN = value.country === 'Bangladesh' || value.country === 'বাংলাদেশ';

  // All countries list with Bangladesh first
  const allCountries = useMemo(() => {
    const list = Country.getAllCountries().map((c) => ({
      name: c.name,
      isoCode: c.isoCode,
    }));
    // Ensure Bangladesh is at the top
    const bdIndex = list.findIndex((c) => c.isoCode === 'BD' || c.name === 'Bangladesh');
    if (bdIndex > -1) {
      const [bd] = list.splice(bdIndex, 1);
      return [bd, ...list];
    }
    return list;
  }, []);

  const selectedCountryObj = useMemo(() => {
    return allCountries.find((c) => c.name === value.country);
  }, [allCountries, value.country]);

  // Bangladesh offline divisions
  const bdDivisions = useMemo(() => {
    return BANGLADESH_DIVISIONS.map((d) => ({
      en: d.en,
      bn: d.bn,
      label: lang === 'bn' ? d.bn : d.en,
      value: d.en,
    }));
  }, [lang]);

  // Bangladesh offline districts
  const bdDistricts = useMemo(() => {
    if (!isBN || !value.divisionState) return [];
    const div = BANGLADESH_DIVISIONS.find(
      (d) => d.en.toLowerCase() === value.divisionState.toLowerCase()
    );
    if (!div) return [];
    return div.districts.map((dist) => ({
      en: dist.en,
      bn: dist.bn,
      label: lang === 'bn' ? dist.bn : dist.en,
      value: dist.en,
    }));
  }, [isBN, value.divisionState, lang]);

  // Bangladesh offline thanas
  const bdThanas = useMemo(() => {
    if (!isBN || !value.divisionState || !value.district) return [];
    const div = BANGLADESH_DIVISIONS.find(
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
  }, [isBN, value.divisionState, value.district, lang]);

  // Other countries states & cities via country-state-city
  const foreignStates = useMemo(() => {
    if (isBN || !selectedCountryObj) return [];
    return State.getStatesOfCountry(selectedCountryObj.isoCode).map((s) => ({
      name: s.name,
      isoCode: s.isoCode,
    }));
  }, [isBN, selectedCountryObj]);

  const foreignStateObj = useMemo(() => {
    if (!foreignStates.length) return null;
    return foreignStates.find((s) => s.name === value.divisionState);
  }, [foreignStates, value.divisionState]);

  const foreignCities = useMemo(() => {
    if (isBN || !selectedCountryObj || !foreignStateObj) return [];
    return City.getCitiesOfState(selectedCountryObj.isoCode, foreignStateObj.isoCode).map(
      (c) => c.name
    );
  }, [isBN, selectedCountryObj, foreignStateObj]);

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
    <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-600" />
          <span>{label}</span>
        </label>
        {value.country && (
          <span className="text-[11px] text-teal-700 font-semibold truncate max-w-[60%] text-right">
            {formatFullAddress(value)}
          </span>
        )}
      </div>

      {/* Optional Village/House/Road/Post Code Line */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          {t.streetLine}
        </label>
        <input
          type="text"
          disabled={disabled}
          value={value.streetRoadPostCode || ''}
          onChange={(e) => handleStreetChange(e.target.value)}
          placeholder="e.g. House 12, Road 4, Sector 7, Uttara / Vill: Shampur, Post: 1230"
          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
        />
      </div>

      {/* 1. Country dropdown first. Nothing else is shown until a country is selected. */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
          {t.country} *
        </label>
        <select
          disabled={disabled}
          value={value.country}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
        >
          <option value="">-- {t.country} --</option>
          {allCountries.map((c) => (
            <option key={c.isoCode} value={c.name}>
              {c.name === 'Bangladesh' && lang === 'bn' ? 'বাংলাদেশ' : c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cascading levels: only shown when Country is selected! */}
      {value.country && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in">
          {/* 2. Division / State */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.division} *
            </label>
            {isBN ? (
              <select
                disabled={disabled}
                value={value.divisionState}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden disabled:bg-slate-100"
              >
                <option value="">-- {t.division} --</option>
                {bdDivisions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
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
                {foreignStates.map((s) => (
                  <option key={s.isoCode} value={s.name}>
                    {s.name}
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
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-hidden"
              />
            )}
          </div>

          {/* 3. District */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.district} *
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

          {/* 4. Thana / Upazila / City */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t.thana} *
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
