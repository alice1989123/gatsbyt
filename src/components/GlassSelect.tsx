"use client";

import React from "react";
import Select from "react-select";
import type { GroupBase, StylesConfig, SingleValue, Theme } from "react-select";

export type SimpleOption<T extends string | number> = {
  label: string;
  value: T;
};

type Props<T extends string | number> = {
  options: SimpleOption<T>[];
  value: SimpleOption<T>;
  onChange: (v: SimpleOption<T>) => void;
  width?: string;
  usePortal?: boolean;
};

const CONTROL_H = 32;

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

const styles: StylesConfig<any, false, GroupBase<any>> = {
  container: (base) => ({ ...base, width: "100%", height: CONTROL_H }),

  control: (base) => ({
    ...base,
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "none",
    minHeight: CONTROL_H,
    height: CONTROL_H,
    padding: 0,
    cursor: "pointer",
    borderRadius: 12,
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

  indicatorsContainer: (base) => ({ ...base, height: CONTROL_H }),

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

export default function GlassSelect<T extends string | number>({
  options,
  value,
  onChange,
  width = "160px",
  usePortal = false,
}: Props<T>) {
  return (
    <div style={{ width }}>
      <Select<SimpleOption<T>, false, GroupBase<SimpleOption<T>>>
        options={options}
        value={value}
        onChange={(s: SingleValue<SimpleOption<T>>) => {
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
