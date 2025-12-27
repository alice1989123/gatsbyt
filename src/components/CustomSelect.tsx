"use client";

import React from "react";
import Select, {
  GroupBase,
  StylesConfig,
  ThemeConfig,
  components,
  SingleValueProps,
  OptionProps,
} from "react-select";

export interface OptionType {
  label: string;
  value: string;
  icon?: string;
}

interface CustomSelectProps {
  options: OptionType[];
  value: OptionType;
  onChange: (selected: OptionType) => void;
  placeholder?: string;
  width?: string;
  withIcons?: boolean;
  isSearchable?: boolean;
}

const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  container: (base) => ({
    ...base,
    width: "100%",
  }),

  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(26, 35, 126, 0.55)", // a bit more “glass”
    borderColor: state.isFocused ? "rgba(0,191,255,0.55)" : "rgba(255,255,255,0.14)",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(0,191,255,0.15)" : "none",
    color: "white",
    borderRadius: 12,
    padding: "2px 6px",
    minHeight: 44,
    cursor: "pointer",
  }),

  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
  }),

  singleValue: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.92)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "rgba(12, 18, 50, 0.96)",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
    marginTop: 8,
  }),

  menuList: (base) => ({
    ...base,
    maxHeight: 260,
    padding: 6,
  }),

  option: (base, state) => {
    // ✅ FIX: style selected option distinctly
    const bg = state.isSelected
      ? "rgba(0,191,255,0.18)"
      : state.isFocused
        ? "rgba(255,255,255,0.08)"
        : "transparent";

    const border = state.isSelected ? "rgba(0,191,255,0.40)" : "transparent";

    return {
      ...base,
      backgroundColor: bg,
      color: "rgba(255,255,255,0.92)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 10px",
      borderRadius: 10,
      border: `1px solid ${border}`,
      userSelect: "none",
    };
  },

  input: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.92)",
  }),

  placeholder: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.55)",
  }),

  indicatorsContainer: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.7)",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "rgba(255,255,255,0.7)",
  }),

  // ✅ Helps when menu is clipped behind chart/cards
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const customTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 12,
  colors: {
    ...theme.colors,
    primary25: "rgba(255,255,255,0.08)",
    primary: "rgba(0,191,255,0.55)",
    neutral0: "transparent",
  },
});

// Icon renderers (only used if withIcons = true)
const SingleValue = (props: SingleValueProps<OptionType, false>) => (
  <components.SingleValue {...props}>
    {props.data.icon ? (
      <img
        src={props.data.icon}
        alt=""
        style={{ width: 18, height: 18, borderRadius: 6 }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    ) : null}
    {props.data.label}
  </components.SingleValue>
);

const Option = (props: OptionProps<OptionType, false>) => (
  <components.Option {...props}>
    {props.data.icon ? (
      <img
        src={props.data.icon}
        alt=""
        style={{ width: 18, height: 18, borderRadius: 6 }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    ) : null}
    {props.data.label}
  </components.Option>
);

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  width = "100%",
  withIcons = false,
  isSearchable = true,
}) => {
  return (
    <div style={{ width }}>
      <Select<OptionType, false>
        options={options}
        value={value}
        onChange={(selected) => {
          // ✅ react-select can pass null
          if (selected) onChange(selected);
        }}
        styles={customStyles}
        theme={customTheme}
        placeholder={placeholder}
        isSearchable={isSearchable}
        components={withIcons ? { SingleValue, Option } : undefined}

        // ✅ prevents clipping inside overflow/blur containers
        menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
        menuPosition="fixed"
      />
    </div>
  );
};

export default CustomSelect;
