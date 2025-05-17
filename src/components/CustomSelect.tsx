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

interface OptionType {
  label: string;
  value: string;
  icon?: string; // optional for icon support
}

// 🎨 Styles
const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (base) => ({
    ...base,
    backgroundColor: "#1a237e",
    borderColor: "#3949ab",
    color: "white",
    borderRadius: "8px",
    padding: "2px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "white",
    display: "flex",
    alignItems: "center",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1a237e",
    borderRadius: "8px",
  }),
  option: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? "#5c6bc0" : "#1a237e",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }),
  input: (base) => ({
    ...base,
    color: "white",
  }),
};

// 🎨 Theme
const customTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary25: "#5c6bc0",
    primary: "#3949ab",
  },
});

// ✅ Declare custom renderers first
const SingleValue = (props: SingleValueProps<OptionType, false>) => (
  <components.SingleValue {...props}>
    <img
      src={props.data.icon}
      alt={props.data.label}
      style={{ width: 20, height: 20, marginRight: 8 }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/icons/default.png";
      }}
    />
    {props.data.label}
  </components.SingleValue>
);

const Option = (props: OptionProps<OptionType, false>) => (
  <components.Option {...props}>
    <img
      src={props.data.icon}
      alt={props.data.label}
      style={{ width: 20, height: 20, marginRight: 8 }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/icons/default.png";
      }}
    />
    {props.data.label}
  </components.Option>
);

// ✅ Props interface
interface CustomSelectProps {
  options: OptionType[];
  value: OptionType;
  onChange: (selected: OptionType) => void;
  placeholder?: string;
  width?: string;
  withIcons?: boolean; // ← optional
}

// ✅ Component
const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  width = "100%",
  withIcons = false,
}) => {
  return (
    <div style={{ padding: "1rem", width }}>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        styles={customStyles}
        theme={customTheme}
        placeholder={placeholder}
        components={withIcons ? { SingleValue, Option } : undefined} // 👈 This works now!
      />
    </div>
  );
};

export default CustomSelect;
