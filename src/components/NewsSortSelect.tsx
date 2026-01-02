"use client";

import React from "react";
import Select from "react-select";
import type {
  GroupBase,
  StylesConfig,
  SingleValue,
  Theme,
} from "react-select";

export type SortValue = "newest" | "oldest";
export type SortOption = { label: string; value: SortValue };

const theme = (t: Theme): Theme => ({
  ...t,
  borderRadius: 14,
  colors: {
    ...t.colors,
    primary: "rgba(0,191,255,0.55)",
    primary25: "rgba(255,255,255,0.08)",
    neutral0: "transparent",
  },
});

type Props = {
  options: SortOption[];
  value: SortOption;
  onChange: (v: SortOption) => void;
  width?: string;
  usePortal?: boolean;
};
const CONTROL_H = 32;

const styles: StylesConfig<SortOption, false, GroupBase<SortOption>> = {
  container: (base) => ({ ...base, width: "100%", height: CONTROL_H }),

  control: (base) => ({
    ...base,
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    minHeight: CONTROL_H,
    height: CONTROL_H,
    padding: 0,
    cursor: "pointer",
    alignItems: "center",
  }),

  valueContainer: (base) => ({
    ...base,
    height: CONTROL_H,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
  }),

  singleValue: (base) => ({
    ...base,
    margin: 0,
    color: "rgba(255,255,255,0.92)",
    fontWeight: 650,
  }),

  indicatorsContainer: (base) => ({
    ...base,
    height: CONTROL_H,
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.75)",
    padding: "0 10px",
  }),

  indicatorSeparator: () => ({ display: "none" }),

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

export default function NewsSortSelect({
  options,
  value,
  onChange,
  width = "160px",
  usePortal = false,
}: Props) {
  return (
    <div style={{ width }}>
      <Select<SortOption, false, GroupBase<SortOption>>
        options={options}
        value={value}
        onChange={(s: SingleValue<SortOption>) => {
          if (s) onChange(s);
        }}
        isSearchable={false}
        styles={styles}
        theme={theme}
        menuPortalTarget={usePortal && typeof window !== "undefined" ? document.body : undefined}
        menuPosition={usePortal ? "fixed" : "absolute"}
      />
    </div>
  );
}
