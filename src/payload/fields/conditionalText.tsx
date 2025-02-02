import React, { useEffect, useState } from 'react'
import { Props } from 'payload/components/fields/Text'
import { Label, TextInput, useFormFields } from 'payload/components/forms'

import './styles.scss';
const baseClass = 'custom-currency-field';
export const ConditionalText: React.FC<Props> = props => {
  const { label } = props
  const [value, setValue] = useState<string>('')

  // Obtém os valores dos fields "price" e "discountPercentage" do formulário
  const price: any = useFormFields(([fields]) => fields.price.value)
  const discount: any = useFormFields(([fields]) => fields.discountPercentage.value)

  const concatFunction = React.useCallback(() => {
    if (typeof price === 'number' && typeof discount === 'number') {
      const discountedPrice = price - (price * discount) / 100
      // Formata o valor para notação contábil (ex: R$ 1.234,56)
      const formattedPrice = discountedPrice.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
      setValue(formattedPrice)
    } else {
      setValue('')
    }
  }, [price, discount])

  useEffect(() => {
    concatFunction()
  }, [price, discount, concatFunction])

  return (
    <div style={{ marginBottom: '2rem' }}>
      <Label label={label} />
      <TextInput
        value={value || ''}
        name="uiField"
        path="uiField"
        onChange={concatFunction}
      />
    </div>
  )
}
