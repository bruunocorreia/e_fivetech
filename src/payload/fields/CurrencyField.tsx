import React from 'react';

// Integração com o Payload
import { useFieldType } from 'payload/components/forms';

// Reaproveitando o Label do Payload
import { Label } from 'payload/components/forms';

// Usando o tipo de props do campo Text (ajuste conforme necessário)
import { Props } from 'payload/components/fields/Text';

// Importa o arquivo SCSS para os estilos
import './styles.scss';

const baseClass = 'custom-currency-field';

const CurrencyField: React.FC<Props> = (props) => {
  const { path, label, required } = props;

  // O valor armazenado será um número (em centavos)
  const { value = '', setValue } = useFieldType({
    path,
  });

  // Estado local para exibição do valor formatado e para controlar o modo de edição
  const [displayValue, setDisplayValue] = React.useState('');
  const [editing, setEditing] = React.useState(false);

  // Quando não estiver editando, atualiza o displayValue com o valor armazenado
  React.useEffect(() => {
    if (!editing && typeof value === 'number') {
      // Converte de centavos para valor com duas casas decimais e troca ponto por vírgula
      setDisplayValue((value / 100).toFixed(2).replace('.', ','));
    }
  }, [value, editing]);

  // Trata a alteração do input:
  // - Filtra para permitir apenas dígitos e uma única vírgula
  // - Converte a vírgula para ponto para fazer o parse e armazena em centavos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    // Remove caracteres que não sejam dígitos ou vírgula
    newValue = newValue.replace(/[^0-9,]/g, '');
    // Permite apenas uma vírgula (mantém somente a primeira)
    const parts = newValue.split(',');
    newValue = parts[0] + (parts[1] ? ',' + parts[1] : '');
    
    setDisplayValue(newValue);

    const numeric = parseFloat(newValue.replace(',', '.'));
    if (!isNaN(numeric)) {
      setValue(Math.round(numeric * 100));
    } else {
      setValue(0);
    }
  };

  // Quando o campo recebe foco, limpamos o display para iniciar uma nova entrada
  const handleFocus = () => {
    setEditing(true);
    setDisplayValue('');
  };

  // Ao perder o foco, voltamos ao modo de exibição
  const handleBlur = () => {
    setEditing(false);
    // Se o usuário não digitou nada, reexibe o valor armazenado formatado
    if (displayValue === '' && typeof value === 'number') {
      setDisplayValue((value / 100).toFixed(2).replace('.', ','));
    }
  };

  return (
    <div className={baseClass}>
      <Label htmlFor={path} label={label} required={required} />
      <div className={`${baseClass}__input-wrapper`}>
        <span className={`${baseClass}__currency-symbol`}>$</span>
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
