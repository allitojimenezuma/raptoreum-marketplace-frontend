import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  VStack,
  createToaster, // Import createToaster for Chakra UI toasts
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Initialize Chakra UI toaster
const toast = createToaster();

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
        toast.error("No autenticado. Por favor, inicia sesión.", { title: "Error" });
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
          toast.error(errorData.message, { title: "Error" });
          setReceivedOffers([]);
        }
      } catch (err) {
        toast.error("Error de red al cargar ofertas recibidas.", { title: "Error" });
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
          toast.error(errorData.message, { title: "Error" });
          setSentOffers([]);
        }
      } catch (err) {
        toast.error("Error de red al cargar ofertas enviadas.", { title: "Error" });
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
      toast.error("No autenticado. Por favor, inicia sesión.", { title: "Error" });
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

    toast.promise(apiCall, {
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
        <Heading mb={6} color="#003459" fontSize="2xl">Ofertas Recibidas</Heading>
        {loadingReceived ? (
          <Spinner size="xl" />
        ) : receivedOffers.length === 0 ? (
          <Text color="gray.500">No tienes ofertas recibidas pendientes.</Text>
        ) : (
          <VStack spacing={6} align="stretch" width="100%">
            {receivedOffers.map(offer => (
              <Box key={offer.id} p={4} borderWidth={1} borderRadius="16px" borderColor="#00345933" bg="#fff" boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="16px">
                <Box textAlign="left">
                  <Text fontWeight="bold">Asset: {offer.asset?.name || 'N/A'}</Text>
                  <Text>Ofertante: {offer.offerer?.name || 'N/A'}</Text>
                  <Text>Cantidad ofertada: <b>{offer.amount} RTM</b></Text>
                </Box>
                <VStack spacing={2} align="end">
                  <Button colorScheme="green" isLoading={actionLoading === offer.id} onClick={() => handleAction(offer.id, 'accept')}>Aceptar</Button>
                  <Button colorScheme="red" isLoading={actionLoading === offer.id} onClick={() => handleAction(offer.id, 'reject')}>Rechazar</Button>
                  <Button variant="ghost" onClick={() => navigate(`/asset/${offer.AssetId}`)}>Ver Asset</Button>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}

        <Heading mt={10} mb={6} color="#003459" fontSize="2xl">Ofertas Enviadas</Heading>
        {loadingSent ? (
          <Spinner size="xl" />
        ) : sentOffers.length === 0 ? (
          <Text color="gray.500">No has enviado ninguna oferta.</Text>
        ) : (
          <VStack spacing={6} align="stretch" width="100%">
            {sentOffers.map(offer => (
              <Box key={offer.id} p={4} borderWidth={1} borderRadius="16px" borderColor="#00345933" bg="#fff" boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="16px">
                <Box textAlign="left">
                  <Text fontWeight="bold">Asset: {offer.asset?.name || 'N/A'}</Text>
                  {/* 
                    The owner of the asset at the time of the offer is in `offer.assetOwnerAtTimeOfOffer`.
                    The *current* owner of the asset (if needed) would be in `offer.asset.Wallet.Usuario`.
                    Choose which one you want to display. For "sent offers", `assetOwnerAtTimeOfOffer` is likely more relevant.
                  */}
                  <Text>Propietario (al ofertar): {offer.assetOwnerAtTimeOfOffer?.name || 'N/A'}</Text>
                  <Text>Cantidad ofertada: <b>{offer.amount} RTM</b></Text>
                  <Text>Estado: <b>{offer.status === 'pending' ? 'Pendiente' : offer.status === 'accepted' ? 'Aceptada' : offer.status === 'rejected' ? 'Rechazada' : offer.status}</b></Text>
                </Box>
                <VStack spacing={2} align="end">
                  <Button variant="ghost" onClick={() => navigate(`/asset/${offer.AssetId}`)}>Ver Asset</Button>
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
