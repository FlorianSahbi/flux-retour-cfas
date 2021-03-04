import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";

const SearchInput = ({ value = "", placeholder = "", onChange }) => {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none" className="ri-search-line" as="i" paddingBottom="1w" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="sm"
        autoFocus
      />
    </InputGroup>
  );
};

SearchInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

export default SearchInput;
