// 'use client';

// import React, { useEffect, useState } from 'react';

// import axios from 'axios';

// const NFeComponent = () => {
//   const [nfeId, setNfeId] = useState(null);
//   const [error, setError] = useState(null);

//   // Simulate fetching the nfeId when the component mounts
//   useEffect(() => {
//     const fetchNFeId = async () => {
//       try {
//         // Replace this with your actual API call to create/get the NF-e ID
//         // For example:
//         // const response = await axios.post('/api/nfe/create');
//         // setNfeId(response.data.nfeId);

//         // Simulating an API call with a timeout
//         setTimeout(() => {
//           setNfeId('');
//         }, 1000);
//       } catch (error) {
//         console.error('Erro ao criar NF-e:', error);
//         setError('Falha ao criar NF-e. Por favor, tente novamente.');
//       }
//     };

//     fetchNFeId();
//   }, []);

//   // Function to download the NF-e PDF
//   const downloadNFePDF = async () => {
//     try {
//       const response = await axios.get(`/api/nfe/${nfeId}/pdf`, {
//         responseType: 'blob', // Important to receive binary data
//       });

//       // Create a URL for the received blob
//       const url = window.URL.createObjectURL(
//         new Blob([response.data], { type: 'application/pdf' }),
//       );

//       // Create a temporary link to trigger the download
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `nfe_${nfeId}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (error) {
//       console.error('Erro ao baixar o PDF da NF-e:', error);
//       alert('Falha ao baixar o PDF da NF-e. Por favor, tente novamente.');
//     }
//   };

//   return (
//     <div className="nfe-container">
//       {error && <p className="error-message">{error}</p>}
//       {nfeId ? (
//         <>
//           <h4>NF-e Criada com Sucesso!</h4>
//           <p>
//             <strong>ID da NF-e:</strong> {nfeId}
//           </p>
//           {/* Button to download the NF-e PDF */}
//           <button onClick={downloadNFePDF}>Baixar NF-e em PDF</button>
//         </>
//       ) : (
//         <p>Criando NF-e...</p>
//       )}
//     </div>
//   );
// };

// export default NFeComponent;
