'use client';

import React, { useEffect, useState } from 'react';

import axios from 'axios';

const NFeComponent = () => {
  const [nfeId, setNfeId] = useState(null);
  const [error, setError] = useState(null);

  // Função para criar a NF-e e obter o ID
  useEffect(() => {
    const createNFe = async () => {
      try {
        const response = await axios.post('/api/nfe/create', {
          // Envie os dados necessários para criar a NF-e
          // Substitua este objeto pelos dados reais
          // Por exemplo, itens do pedido, dados do cliente, etc.
        });

        // Extrai o ID da NF-e da resposta da API
        const nfeId = response.data.documents[0].id;
        console.log('NF-e ID:', nfeId);
        setNfeId(nfeId); // Armazena o ID da NF-e no estado
      } catch (error) {
        console.error('Erro ao criar a NF-e:', error);
        setError('Falha ao criar a NF-e. Por favor, tente novamente.');
      }
    };

    createNFe();
  }, []);

  // Função para obter o PDF da NF-e
  const downloadNFePDF = async () => {
    try {
      const response = await axios.get(`/api/nfe/${nfeId}/pdf`, {
        responseType: 'blob', // Importante para receber dados binários
      });

      // Cria um URL para o blob recebido
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' }),
      );

      // Cria um link temporário para fazer o download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nfe_${nfeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar o PDF da NF-e:', error);
      alert('Falha ao baixar o PDF da NF-e. Por favor, tente novamente.');
    }
  };

  return (
    <div className="nfe-container">
      {error && <p className="error-message">{error}</p>}
      {nfeId ? (
        <>
          <h4>NF-e Criada com Sucesso!</h4>
          <p>
            <strong>ID da NF-e:</strong> {nfeId}
          </p>
          {/* Botão para baixar o PDF da NF-e */}
          <button onClick={downloadNFePDF}>
            Baixar NF-e em PDF
          </button>
        </>
      ) : (
        <p>Criando NF-e...</p>
      )}
    </div>
  );
};

export default NFeComponent;
