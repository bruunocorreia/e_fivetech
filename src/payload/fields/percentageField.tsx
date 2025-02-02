import React from 'react';

// Integração com o Payload
import { useFieldType } from 'payload/components/forms';

// Reaproveitando o componente Label do Payload
import { Label } from 'payload/components/forms';

// Utilizando o tipo de props do campo Text (ajuste conforme necessário)
import { Props } from 'payload/components/fields/Text';

// Importa o arquivo SCSS para os estilos
import './styles.scss';

const baseClass = 'custom-percentage-field';

const PercentageField: React.FC<Props> = (props) => {
  const { path, label, required } = props;

  // O valor armazenado será um número (representando a porcentagem)
  const { value = '', setValue } = useFieldType({
    path,
  });

  // Estado local para exibição do valor formatado (apenas a parte inteira)
  // Quando não estiver editando, o display inclui o "%" concatenado logo após o número.
  const [displayValue, setDisplayValue] = React.useState('');
  const [editing, setEditing] = React.useState(false);

  // Atualiza o display quando não estiver editando: exibe somente a parte inteira seguida de "%" sem espaçamento extra.
  React.useEffect(() => {
    if (!editing && typeof value === 'number') {
      setDisplayValue(`${Math.trunc(value)}%`);
    }
  }, [value, editing]);

  // Trata a alteração do input:
  // Permite apenas dígitos, converte para inteiro, limita entre 0 e 100 e armazena o valor.
  // O símbolo "%" é removido (caso tenha sido colado) para evitar interferência.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Remove qualquer caractere que não seja dígito (removendo também o %, se presente)
    newValue = newValue.replace(/[^0-9]/g, '');

    // Converte para número inteiro
    const numeric = parseInt(newValue, 10);
    if (!isNaN(numeric)) {
      // Limita o valor entre 0 e 100
      const clamped = Math.max(0, Math.min(numeric, 100));
      setDisplayValue(String(clamped));
      setValue(clamped);
    } else {
      setDisplayValue('');
      setValue(0);
    }
  };

  // Ao focar, remove o símbolo "%" para permitir a edição do valor puro
  const handleFocus = () => {
    setEditing(true);
    // Remove o "%" do valor exibido
    if (typeof value === 'number') {
      setDisplayValue(String(Math.trunc(value)));
    } else {
      setDisplayValue('');
    }
  };

  // Ao sair do foco, volta ao modo de exibição concatenado com "%" imediatamente após o número
  const handleBlur = () => {
    setEditing(false);
    if (displayValue === '' && typeof value === 'number') {
      setDisplayValue(`${Math.trunc(value)}%`);
    } else {
      // Garante que o displayValue não contenha espaços ou caracteres extras
      const numeric = parseInt(displayValue, 10);
      if (!isNaN(numeric)) {
        setDisplayValue(`${numeric}%`);
      }
    }
  };

  return (
    <div className={baseClass}>
      <Label htmlFor={path} label={label} required={required} />
      <div className={`${baseClass}__input-wrapper`}>
        <input
          type="text"
          id={path}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="0"
          className={`${baseClass}__input`}
        />
      </div>
    </div>
  );
};

export default PercentageField;
