import React, { useState } from 'react';
import Select from 'react-select';

const countryOptions = [
  { value: 'colombia', label: (
    <div>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg"
        alt="Colômbia"
        width="20"
        height="15"
        style={{ marginRight: '5px' }}
      />
      Colombia
    </div>
  )},
];

function SelectCountry() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
  };

  return (
    <Select
      options={countryOptions}
      value={selectedCountry}
      onChange={handleChange}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          width: '450px',
          color:'rgb(255, 56, 56)' // Ajuste o valor conforme necessário
        }),
      }}
    />
  );
}

export default SelectCountry;