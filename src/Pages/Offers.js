import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  VStack,
  Input
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/offers/received', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setOffers(data.offers || []);
        } else {
          setOffers([]);
        }
      } catch (err) {
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchSentOffers = async () => {
      setLoadingSent(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/offers/sent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSentOffers(data.offers || []);
        } else {
          setSentOffers([]);
        }
      } catch (err) {
        setSentOffers([]);
      } finally {
        setLoadingSent(false);
      }
    };
    fetchOffers();
    fetchSentOffers();
  }, []);

  const handleAction = async (offerId, action) => {
    setActionLoading(offerId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/offers/${offerId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setToastMsg(`Oferta ${action === 'accept' ? 'aceptada' : 'rechazada'} correctamente`);
        setOffers(offers.filter(o => o.id !== offerId));
      } else {
        setToastMsg('Error al procesar la oferta');
      }
    } catch {
      setToastMsg('Error de red');
    } finally {
      setActionLoading(null);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <Box className="asset-card" style={{ border: '3px solid #003459', borderRadius: '24px', background: '#fff', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459', transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1), transform 0.2s', padding: 0, margin: '32px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', overflow: 'hidden' }}>
      <Box p={6} width="100%" textAlign="center" bg="#f7fafc" display="flex" flexDirection="column" alignContent="center" alignItems="center" gap="10px" style={{ borderBottomLeftRadius: '21px', borderBottomRightRadius: '21px' }}>
        <Heading mb={6} color="#003459" fontSize="2xl">Ofertas recibidas</Heading>
        {toastMsg && (
          <Box bg="#003459" color="white" p={2} borderRadius="8px" mb={4} textAlign="center">{toastMsg}</Box>
        )}
        {loading ? (
          <Spinner size="xl" />
        ) : offers.length === 0 ? (
          <Text color="gray.500">No tienes ofertas pendientes.</Text>
        ) : (
          <VStack spacing={6} align="stretch" width="100%">
            {offers.map(offer => (
              <Box key={offer.id} p={4} borderWidth={1} borderRadius="16px" borderColor="#00345933" bg="#fff" boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="16px">
                <Box textAlign="left">
                  <Text fontWeight="bold">Asset: {offer.assetName}</Text>
                  <Text>Ofertante: {offer.offererName}</Text>
                  <Text>Cantidad ofertada: <b>{offer.amount} RTM</b></Text>
                </Box>
                <VStack spacing={2} align="end">
                  <Button colorScheme="green" isLoading={actionLoading === offer.id} onClick={() => handleAction(offer.id, 'accept')}>Aceptar</Button>
                  <Button colorScheme="red" isLoading={actionLoading === offer.id} onClick={() => handleAction(offer.id, 'reject')}>Rechazar</Button>
                  <Button variant="ghost" onClick={() => navigate(`/asset/${offer.assetId}`)}>Ver Asset</Button>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}
        <Heading mt={10} mb={6} color="#003459" fontSize="2xl">Ofertas enviadas</Heading>
        {loadingSent ? (
          <Spinner size="xl" />
        ) : sentOffers.length === 0 ? (
          <Text color="gray.500">No has enviado ofertas.</Text>
        ) : (
          <VStack spacing={6} align="stretch" width="100%">
            {sentOffers.map(offer => (
              <Box key={offer.id} p={4} borderWidth={1} borderRadius="16px" borderColor="#00345933" bg="#fff" boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="16px">
                <Box textAlign="left">
                  <Text fontWeight="bold">Asset: {offer.assetName}</Text>
                  <Text>Propietario: {offer.ownerName}</Text>
                  <Text>Cantidad ofertada: <b>{offer.amount} RTM</b></Text>
                  <Text>Estado: <b>{offer.status === 'pending' ? 'Pendiente' : offer.status === 'accepted' ? 'Aceptada' : 'Rechazada'}</b></Text>
                </Box>
                <VStack spacing={2} align="end">
                  <Button variant="ghost" onClick={() => navigate(`/asset/${offer.assetId}`)}>Ver Asset</Button>
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
