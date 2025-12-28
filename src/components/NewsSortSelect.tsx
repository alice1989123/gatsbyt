"use client";

import React from "react";
import Select from "react-select";
import type { GroupBase, StylesConfig, ThemeConfig } from "react-select";

export type SortValue = "newest" | "oldest";
export type SortOption = { label: string; value: SortValue };

type Props = {
  options: SortOption[];
  value: SortOption;
  onChange: (v: SortOption) => void;
  width?: string;
  usePortal?: boolean; // ✅ NEW
};

const styles: StylesConfig<SortOption, false, GroupBase<SortOption>> = {
  container: (base) => ({ ...base, width: "100%" }),

  control: (base, state) => ({
    ...base,
    backgroundColor: "transparent", // ✅ let .sortShell be the glass background
    border: "none",                 // ✅ remove inner border (double border issue)
    boxShadow: "none",
    minHeight: 48,
    cursor: "pointer",
  }),

  valueContainer: (base) => ({ ...base, padding: "0 10px" }),

  singleValue: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.92)",
    fontWeight: 650,
  }),

  placeholder: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.60)",
  }),

  indicatorSeparator: () => ({ display: "none" }), // ✅ remove divider line

  dropdownIndicator: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.75)",
    paddingRight: 10,
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "rgba(12, 18, 50, 0.96)",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginTop: 8,
  }),

  menuList: (base) => ({ ...base, padding: 6 }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(0,191,255,0.18)"
      : state.isFocused
      ? "rgba(255,255,255,0.08)"
      : "transparent",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
    borderRadius: 12,
    padding: "10px 12px",
  }),
};

const theme: ThemeConfig = (t) => ({
  ...t,
  borderRadius: 14,
  colors: {
    ...t.colors,
    primary: "rgba(0,191,255,0.55)",
    primary25: "rgba(255,255,255,0.08)",
    neutral0: "transparent",
  },
});

export default function NewsSortSelect({
  options,
  value,
  onChange,
  width = "160px",
  usePortal = false,
}: Props) {
  return (
    <div style={{ width }}>
      <Select
        options={options}
        value={value}
        onChange={(s:any) => s && onChange(s)}
        isSearchable={false}
        styles={styles}
        theme={theme}
        menuPortalTarget={usePortal && typeof window !== "undefined" ? document.body : undefined}
        menuPosition={usePortal ? "fixed" : "absolute"}
      />
    </div>
  );
}
