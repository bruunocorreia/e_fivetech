'use client'

import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'

import { useAuth } from '../../_providers/Auth'
import { Button } from '../Button'
import { Input } from '../Input'
import { Message } from '../Message'

import classes from './index.module.scss'

type FormData = {
  ref: string
}

export const NFeCreator = ({ onNFeCreation, onRefChange }) => {
  const [nfeInfo, setNfeInfo] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user, setUser } = useAuth()

  const ref = user?.ref || null

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    reset,
    watch,
  } = useForm<FormData>()

  useEffect(() => {
    if (ref) {
      reset({ ref })
      createNFe({ ref })
    }
  }, [ref, reset])

  const createNFe = useCallback(
    async data => {
      const { ref } = data
      onRefChange(ref)

      setError('')
      setNfeInfo(null)

      try {
        const response = await axios.post('/api/enviar-nfe', { ref })
        const nfeResponse = response.data

        const formattedNfeInfo = {
          price: parseFloat(nfeResponse.valor_total),
          deliveryTime: `${nfeResponse.data_entrada_saida}`,
          serviceId: nfeResponse.ref,
        }

        setNfeInfo(formattedNfeInfo)
        onNFeCreation(formattedNfeInfo.price, formattedNfeInfo.serviceId)
        if (!ref) {
          await updateUserRef(ref)
        }
      } catch (err) {
        console.error('Erro ao criar NF-e:', err)
        setError('Falha ao criar a NF-e. Tente novamente.')
        onNFeCreation(0, null)
      }
    },
    [onNFeCreation, ref],
  )

  const updateUserRef = useCallback(
    async ref => {
      if (user && !ref && ref !== ref) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          credentials: 'include',
          method: 'PATCH',
          body: JSON.stringify({ ref }),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const json = await response.json()
          setUser(json.doc)
          setError('')
        } else {
          setError('There was a problem updating your account.')
        }
      }
    },
    [user, setUser],
  )

  return (
    <form onSubmit={handleSubmit(createNFe)} className={classes.form}>
      <Message error={error} success={success} className={classes.message} />
      {!ref && (
        <Fragment>
          <Input name="ref" label="Referência da Nota" register={register} type="text" />
          <Button
            type="submit"
            label={isLoading ? 'Criando...' : 'Criar Nota Fiscal'}
            disabled={isLoading}
            appearance="primary"
            className={classes.submit}
          />
        </Fragment>
      )}
      {nfeInfo && ref && (
        <div className={classes.result}>
          <b>
            <p>Valor Total: R$ {nfeInfo.price}</p>
          </b>
          <p>Data de Emissão: {nfeInfo.deliveryTime}</p>
        </div>
      )}
    </form>
  )
}

export default NFeCreator
