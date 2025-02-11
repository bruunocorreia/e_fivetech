import React from 'react'
// Utilizando o tipo de props do campo Text (ajuste conforme necessário)
import { Props } from 'payload/components/fields/Text'
// Reaproveitando o componente Label do Payload
import { Label, useFieldType } from 'payload/components/forms'

// Importa o arquivo SCSS para os estilos
import './styles.scss'

const baseClass = 'custom-currency-field'

const CurrencyField: React.FC<Props> = props => {
  const { path, label, required } = props

  // O valor armazenado agora será um número decimal (em dólares)
  const { value = '', setValue } = useFieldType({
    path,
  })

  // Estado local para exibição do valor formatado
  const [displayValue, setDisplayValue] = React.useState('')
  const [editing, setEditing] = React.useState(false)

  // Quando não estiver editando, atualiza o display com o valor armazenado
  React.useEffect(() => {
    if (!editing && typeof value === 'number') {
      // Formata o número com 2 casas decimais e substitui o ponto pela vírgula
      setDisplayValue(value.toFixed(2).replace('.', ','))
    }
  }, [value, editing])

  // Trata a alteração do input:
  // Permite apenas dígitos e uma única vírgula,
  // converte a vírgula para ponto para o parseFloat e armazena o valor sem multiplicação.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Remove caracteres que não sejam dígitos ou vírgula
    newValue = newValue.replace(/[^0-9,]/g, '')

    // Permite apenas uma vírgula (mantém somente a primeira)
    const parts = newValue.split(',')
    newValue = parts[0] + (parts[1] ? ',' + parts[1] : '')

    setDisplayValue(newValue)

    // Converte a vírgula para ponto e utiliza parseFloat
    const numeric = parseFloat(newValue.replace(',', '.'))
    if (!isNaN(numeric)) {
      // Armazena o valor diretamente (em dólares)
      setValue(numeric)
    } else {
      setValue(0)
    }
  }

  // Ao focar, limpa o display para iniciar nova entrada
  const handleFocus = () => {
    setEditing(true)
    setDisplayValue('')
  }

  // Ao sair do foco, volta ao modo de exibição formatada
  const handleBlur = () => {
    setEditing(false)
    if (displayValue === '' && typeof value === 'number') {
      setDisplayValue(value.toFixed(2).replace('.', ','))
    }
  }

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
  )
}

export default CurrencyField
