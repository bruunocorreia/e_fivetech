import React from 'react';

// Integração com o Payload
import { useFieldType } from 'payload/components/forms';

// Reaproveitando o componente Label do Payload
import { Label } from 'payload/components/forms';

// Utilizando o tipo de props do campo Text (ajuste se necessário)
import { Props } from 'payload/components/fields/Text';

// Importa o arquivo SCSS para os estilos
import './styles.scss';

const baseClass = 'custom-currency-field';

const CurrencyField: React.FC<Props> = (props) => {
  const { path, label, required } = props;

  // Valor armazenado será um número em dólares (decimal)
  const { value = '', setValue } = useFieldType({
    path,
  });

  // Estado local para exibição e controle do modo de edição
  const [displayValue, setDisplayValue] = React.useState('');
  const [editing, setEditing] = React.useState(false);

  // Quando não estiver editando, formata o valor armazenado para exibição (com 2 casas decimais e vírgula como separador)
  React.useEffect(() => {
    if (!editing && typeof value === 'number') {
      setDisplayValue(value.toFixed(2).replace('.', ','));
    }
  }, [value, editing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Remove quaisquer caracteres que não sejam dígitos ou vírgula
    newValue = newValue.replace(/[^0-9,]/g, '');

    // Permite apenas uma vírgula e, se o usuário digitou a vírgula sem nenhum dígito depois, preserva-a
    const parts = newValue.split(',');
    if (newValue.indexOf(',') !== -1 && parts[1] === '') {
      newValue = parts[0] + ',';
    } else {
      newValue = parts[0] + (parts[1] ? ',' + parts[1] : '');
    }

    setDisplayValue(newValue);

    // Converte a vírgula para ponto para realizar o parse
    const numeric = parseFloat(newValue.replace(',', '.'));
    if (!isNaN(numeric)) {
      setValue(numeric);
    } else {
      setValue(0);
    }
  };

  // Ao receber foco, limpa o campo para iniciar uma nova entrada (substituindo o valor atual)
  const handleFocus = () => {
    setEditing(true);
    setDisplayValue('');
  };

  // Ao perder o foco, volta para o modo de exibição formatada
  const handleBlur = () => {
    setEditing(false);
    if (displayValue === '' && typeof value === 'number') {
      setDisplayValue(value.toFixed(2).replace('.', ','));
    }
  };

  return (
    <div className={baseClass}>
      <Label htmlFor={path} label={label} required={required} />
      <div className={`${baseClass}__input-wrapper`}>
        <span className={`${baseClass}__currency-symbol`}>R$</span>
        <input
          type="text"
          id={path}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="0,00"
          className={`${baseClass}__input`}
        />
      </div>
    </div>
  );
};

export default CurrencyField;
