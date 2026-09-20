import React from 'react';
import Select, { Props as SelectProps } from 'react-select';

// Tipos de opção para o select
interface Option {
    value: any;
    label: string;
}

// Tipos das props do componente
interface Select2Props extends Partial<SelectProps<Option, boolean>> {
    id: string;
    label: string;
    required?: boolean;
}

const Select2: React.FC<Select2Props> = (props) => {
    const {
        id,
        label,
        required,
        ...selectProps
    } = props;

    return (
        <div>
            {label ? (
                <label htmlFor={id} style={{fontWeight: "500"}} className="fs-14 text-dark mb-2">
                    {label} {required ? '*' : null}
                </label>
            ) : null}

            <Select
                inputId={id}
                classNamePrefix="react-select"
                {...selectProps}
            />
        </div>
    );
};

export default Select2;
