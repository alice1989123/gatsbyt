// components/CustomSelect.tsx
"use client";

import React from "react";
import Select, { GroupBase, StylesConfig, ThemeConfig } from "react-select";

const customStyles: StylesConfig<any, false, GroupBase<any>> = {
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
  }),
  input: (base) => ({
    ...base,
    color: "white",
  }),
};

const customTheme: ThemeConfig = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary25: "#5c6bc0",
    primary: "#3949ab",
  },
});

interface CustomSelectProps {
  options: { label: string; value: string }[];
  value: { label: string; value: string };
  onChange: (selected: { label: string; value: string }) => void;
  placeholder?: string;
  width?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  width = "100%",
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
      />
    </div>
  );
};

export default CustomSelect;
