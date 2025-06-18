import React, { useEffect, useState } from 'react';
import { Box, Heading, Spinner, Text, Center } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { toaster } from '../Components/ui/toaster';

const TransactionHistory = ({ assetId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      let url, headers = {};
      if (assetId) {
        url = `http://localhost:3000/assets/${assetId}/history`;
      } else {
        url = 'http://localhost:3000/user/history';
        const token = localStorage.getItem('token');
        if (!token) {
          toaster.create({
            title: 'Error de autenticación',
            description: 'Por favor, inicia sesión para ver tu historial.',
            type: 'error',
          });
          setLoading(false);
          return;
        }
        headers.Authorization = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'No se pudo cargar el historial.');
        }
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        toaster.create({
          title: 'Error al cargar el historial',
          description: error.message,
          type: 'error',
        });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [assetId]);

  if (loading) {
    return (
      <Center mt={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box maxW="900px" mx="auto" mt={10} p={6} bg="white" borderRadius="10px" boxShadow="0 8px 32px 0 rgba(0,52,89,0.25)" color="#003459" style={{ border: '3px solid #003459' }}>
      <Heading mb={6} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">
        Historial de Transacciones
      </Heading>
      {history.length === 0 ? (
        <Text>No hay transacciones en el historial.</Text>
      ) : (
        history.map((tx, idx) => (
          <Box key={tx.id} p={4} borderRadius="md" mb={4} borderWidth="1px" borderColor="gray.200">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Heading size="sm">
                Asset:{' '}
                <RouterLink
                  to={`/asset/${tx.AssetId}`}
                  style={{ color: "#007ea7", fontWeight: "bold", textDecoration: "underline" }}
                >
                  {tx.asset?.name || 'Desconocido'}
                </RouterLink>
              </Heading>
              <Box
                as="span"
                px={2}
                py={1}
                borderRadius="md"
                bg="#e0e7ef"
                color="#003459"
                fontWeight="bold"
                fontSize="sm"
              >
                {tx.transactionType}
              </Box>
            </Box>
            <Text fontSize="sm">
              <b>Fecha:</b> {new Date(tx.createdAt).toLocaleString('es-ES')}
            </Text>
            {tx.priceAtTransaction > 0 && (
              <Text fontSize="sm">
                <b>Precio:</b> {tx.priceAtTransaction} RTM
              </Text>
            )}
            {tx.buyer && (
              <Text fontSize="sm">
                <b>Comprador:</b> {tx.buyer.name} ({tx.buyer.email})
              </Text>
            )}
            {tx.seller && (
              <Text fontSize="sm">
                <b>Vendedor:</b> {tx.seller.name} ({tx.seller.email})
              </Text>
            )}
            <Text fontSize="sm" color="gray.500">
              ID de Transacción: {tx.blockchainAssetTxId || 'N/A'}
            </Text>
          </Box>
        ))
      )}
    </Box>
  );
};

export default TransactionHistory;