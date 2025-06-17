import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { toaster } from '../Components/ui/toaster';

const Offers = () => {
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // To track loading state for accept/reject buttons
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceivedOffers = async () => {
      setLoadingReceived(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toaster.error("No autenticado. Por favor, inicia sesión.", { title: "Error" });
        setLoadingReceived(false);
        setReceivedOffers([]);
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/offers/my/received', { // Updated endpoint
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setReceivedOffers(data || []); // Backend returns an array directly
        } else {
          const errorData = await response.json().catch(() => ({ message: "Error al cargar ofertas recibidas." }));
          toaster.error(errorData.message, { title: "Error" });
          setReceivedOffers([]);
        }
      } catch (err) {
        toaster.error("Error de red al cargar ofertas recibidas.", { title: "Error" });
        setReceivedOffers([]);
      } finally {
        setLoadingReceived(false);
      }
    };

    const fetchSentOffers = async () => {
      setLoadingSent(true);
      const token = localStorage.getItem('token');
      if (!token) {
        // No need to toast again if already toasted by fetchReceivedOffers
        setLoadingSent(false);
        setSentOffers([]);
        return;
      }
      try {
        const response = await fetch('http://localhost:3000/offers/my/made', { // Updated endpoint
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSentOffers(data || []); // Backend returns an array directly
        } else {
          const errorData = await response.json().catch(() => ({ message: "Error al cargar ofertas enviadas." }));
          toaster.error(errorData.message, { title: "Error" });
          setSentOffers([]);
        }
      } catch (err) {
        toaster.error("Error de red al cargar ofertas enviadas.", { title: "Error" });
        setSentOffers([]);
      } finally {
        setLoadingSent(false);
      }
    };

    fetchReceivedOffers();
    fetchSentOffers();
  }, []);

  const handleAction = async (offerId, action) => {
    setActionLoading(offerId); // Set loading state for the specific offer being actioned
    const token = localStorage.getItem('token');
    if (!token) {
      toaster.error("No autenticado. Por favor, inicia sesión.", { title: "Error" });
      setActionLoading(null);
      return;
    }

    // Assuming these endpoints exist on your backend:
    // POST /offers/:offerId/accept
    // POST /offers/:offerId/reject
    const apiCall = fetch(`http://localhost:3000/offers/${offerId}/${action}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error al ${action === 'accept' ? 'aceptar' : 'rechazar'} la oferta.` }));
        throw new Error(errorData.message);
      }
      return response.json();
    });

    toaster.promise(apiCall, {
      loading: `Procesando oferta...`,
      success: (data) => {
        // Remove the offer from the list upon successful action
        setReceivedOffers(prevOffers => prevOffers.filter(o => o.id !== offerId));
        // Optionally, refresh sent offers if accepting/rejecting might change their status display
        // fetchSentOffers(); 
        return data.message || `Oferta ${action === 'accept' ? 'aceptada' : 'rechazada'} correctamente`;
      },
      error: (err) => {
        return err.message || `Error al procesar la oferta.`;
      },
    });

    apiCall.finally(() => {
      setActionLoading(null); // Clear loading state for the specific offer
    });
  };

  return (
    <Box className="asset-card" style={{ border: '3px solid #003459', borderRadius: '24px', background: '#fff', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459', transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1), transform 0.2s', padding: 0, margin: '32px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px', overflow: 'hidden' }}>
      <Box p={6} width="100%" textAlign="center" bg="#f7fafc" display="flex" flexDirection="column" alignContent="center" alignItems="center" gap="10px" style={{ borderBottomLeftRadius: '21px', borderBottomRightRadius: '21px' }}>
        <Heading mb={4} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Ofertas Recibidas</Heading>
        {loadingReceived ? (
          <Spinner size="xl" />
        ) : receivedOffers.length === 0 ? (
          <Text color="gray.500">No tienes ofertas recibidas pendientes.</Text>
        ) : (
          <VStack spacing={6} align="stretch" width="100%">
            {receivedOffers.map(offer => (
              <Box key={offer.id} p={4} borderWidth={1} borderRadius="16px" borderColor="#00345933" bg="#fff" boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="16px">
                <Box textAlign="left">
                  <Text fontWeight="bold" color="#003459">Asset: {offer.asset?.name || 'N/A'}</Text>
                  <Text color="#003459">Ofertante: {offer.offerer?.name || 'N/A'}</Text>
                  <Text color="#003459">Cantidad ofertada: <b>{Number(offer.offerPrice) % 1 === 0 ? Number(offer.offerPrice) : Number(offer.offerPrice).toFixed(2)} RTM</b></Text>
                </Box>
                <VStack spacing={2} align="end">
                  <Button
                    bg="green.500"
                    color="#fff"
                    borderRadius="10px"
                    border="2px solid #003459"
                    width="120px"
                    isLoading={actionLoading === offer.id}
                    onClick={() => handleAction(offer.id, 'accept')}
                    _hover={{ bg: 'green.600' }}
                  >Aceptar</Button>
                  <Button
                    bg="red.500"
                    color="#fff"
                    borderRadius="10px"
                    border="2px solid #003459"
                    width="120px"
                    isLoading={actionLoading === offer.id}
                    onClick={() => handleAction(offer.id, 'reject')}
                    _hover={{ bg: 'red.600' }}
                  >Rechazar</Button>
                  <Button
                    bg="#fff"
                    color="#003459"
                    borderRadius="10px"
                    border="2px solid #003459"
                    width="120px"
                    onClick={() => navigate(`/asset/${offer.AssetId}`)}
                    _hover={{ bg: '#e2e8f0' }}
                  >Ver Asset</Button>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}

        <Heading mt={10} mb={6} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Ofertas Enviadas</Heading>
        {loadingSent ? (
          <Spinner size="xl" />
        ) : sentOffers.length === 0 ? (
          <Text color="gray.500">No has enviado ninguna oferta.</Text>
        ) : (
          <VStack spacing={6} align="stretch" width="100%">
            {sentOffers.map(offer => (
              <Box key={offer.id} p={4} borderWidth={1} borderRadius="16px" borderColor="#00345933" bg="#fff" boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="16px">
                <Box textAlign="left">
                  <Text fontWeight="bold" color="#003459">Asset: {offer.asset?.name || 'N/A'}</Text>
                  <Text color="#003459">Propietario (al ofertar): {offer.assetOwnerAtTimeOfOffer?.name || 'N/A'}</Text>
                  <Text color="#003459">Cantidad ofertada: <b>{Number(offer.offerPrice) % 1 === 0 ? Number(offer.offerPrice) : Number(offer.offerPrice).toFixed(2)} RTM</b></Text>
                  <Text color="#003459">Estado: <b>{offer.status === 'pending' ? 'Pendiente' : offer.status === 'accepted' ? 'Aceptada' : offer.status === 'rejected' ? 'Rechazada' : offer.status}</b></Text>
                </Box>
                <VStack spacing={2} align="end">
                  <Button
                    variant="ghost"
                    color="#003459"
                    borderRadius="10px"
                    width="120px"
                    onClick={() => navigate(`/asset/${offer.AssetId}`)}
                    _hover={{ bg: '#e2e8f0' }}
                  >Ver Asset</Button>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default Offers;
