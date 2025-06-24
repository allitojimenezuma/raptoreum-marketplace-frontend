import React, { useEffect, useState, useCallback } from 'react';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Refactor: extrae los fetch para poder llamarlos tras aceptar/rechazar
  const fetchReceivedOffers = useCallback(async () => {
    setLoadingReceived(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toaster.error("No autenticado. Por favor, inicia sesión.", { title: "Error" });
      setLoadingReceived(false);
      setReceivedOffers([]);
      return;
    }
    try {
      const response = await fetch('https://rtm.api.test.unknowngravity.com/offers/my/received', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReceivedOffers(data || []);
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
  }, []);

  const fetchSentOffers = useCallback(async () => {
    setLoadingSent(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingSent(false);
      setSentOffers([]);
      return;
    }
    try {
      const response = await fetch('https://rtm.api.test.unknowngravity.com/offers/my/made', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSentOffers(data || []);
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
  }, []);

  useEffect(() => {
    fetchReceivedOffers();
    fetchSentOffers();
  }, [fetchReceivedOffers, fetchSentOffers]);

  const handleAction = async (offerId, action) => {
    setActionLoading(offerId);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      toaster.error("No autenticado. Por favor, inicia sesión.", { title: "Error" });
      setActionLoading(null);
      return;
    }

    if (action === 'accept') {
      if (!window.confirm('¿Estás seguro de que deseas aceptar esta oferta? Se realizará la transacción en blockchain y el asset cambiará de propietario.')) {
        setActionLoading(null);
        return;
      }
      toaster.create({ title: 'Procesando compra en blockchain', description: 'Espere unos minutos antes de recargar la página.', type: 'info', duration: 12000 });
      // Timeout manual (30 segundos)
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        toaster.create({
          title: 'La transacción está tardando más de lo habitual, pero sigue en proceso.',
          description: 'Te notificaremos al completarse.',
          type: 'info',
          duration: 12000
        });
        setActionLoading(null);
      }, 30000);
      try {
        const response = await fetch(`https://rtm.api.test.unknowngravity.com/offers/${offerId}/accept`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Error al aceptar la oferta.` }));
          throw new Error(errorData.message);
        }
        await fetchReceivedOffers(); // Refresca la lista tras aceptar
        await fetchSentOffers();
        toaster.create({ title: '¡Oferta aceptada y asset transferido correctamente!', type: 'success', duration: 10000 });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Ocurrió un error al aceptar la oferta. Intenta nuevamente.');
          toaster.create({ title: err.message || 'Error al aceptar la oferta.', type: 'error', duration: 10000 });
        }
      } finally {
        clearTimeout(timeout);
        setActionLoading(null);
      }
      return;
    }

    // Para rechazar
    const apiCall = fetch(`https://rtm.api.test.unknowngravity.com/offers/${offerId}/${action}`, {
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
      loading: { title: "Procesando oferta...", description: "La transacción está en curso. Por favor, espere unos minutos." },
      success: async (data) => {
        await fetchReceivedOffers();
        await fetchSentOffers();
        if (action === 'accept') {
          return { title: '¡Oferta aceptada y asset transferido correctamente!' };
        }
        return { title: data.message || `Oferta rechazada correctamente` };
      },
      error: (err) => {
        return { title: err.message || `Error al procesar la oferta.` };
      },
    });

    apiCall.finally(() => {
      setActionLoading(null);
    });
  };

  // Handler para cancelar oferta enviada
  const handleCancelSentOffer = async (offerId) => {
    setActionLoading(offerId);
    const token = localStorage.getItem('token');
    if (!token) {
      toaster.error("No autenticado. Por favor, inicia sesión.", { title: "Error" });
      setActionLoading(null);
      return;
    }
    const apiCall = fetch(`https://rtm.api.test.unknowngravity.com/offers/${offerId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          return response.json()
            .then((errorData) => {
              throw new Error(errorData.message);
            })
            .catch(() => {
              throw new Error('Error al cancelar la oferta.');
            });
        }
        return response.json();
      })
      .catch((err) => {
        throw err;
      });
    toaster.promise(apiCall, {
      loading: `Cancelando oferta...`,
      success: async (data) => {
        await fetchSentOffers();
        return { title: data.message || `Oferta cancelada correctamente` };
      },
      error: (err) => {
        return { title: err.message || `Error al cancelar la oferta.` };
      },
    });
    apiCall.finally(() => {
      setActionLoading(null);
    });
  };

  return (
    <Box className="asset-card" style={{ border: '3px solid #003459', borderRadius: '24px', background: '#fff', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459', transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1), transform 0.2s', padding: 0, margin: '32px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '800px', overflow: 'hidden' }}>
      {/* Mensajes de error globales (solo error, timeout va por toaster) */}
      {error && <Text color="red.500" fontWeight="bold" mb={2}>{error}</Text>}
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
                  {offer.status === 'accepted' ? (
                    <Text color="green.600" fontWeight="bold" fontSize="sm">
                      Aceptada el: {new Date(offer.updatedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </Text>
                  ) : offer.status === 'pending' && offer.expiresAt && (
                    <Text color={new Date(offer.expiresAt) < new Date() ? 'red.500' : '#949494'} fontSize="sm">
                      {new Date(offer.expiresAt) < new Date()
                        ? 'Oferta Expirada'
                        : `Fecha de Expiración: ${new Date(offer.expiresAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}`}
                    </Text>
                  )}
                </Box>
                <VStack spacing={2} align="end">
                  {offer.status === 'pending' && (!offer.expiresAt || new Date(offer.expiresAt) >= new Date()) && (
                    <>
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
                    </>
                  )}
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
            {sentOffers.map(offer => {
              // Determinar el estado visual
              let estadoTexto = '';
              let estadoColor = '#003459';
              if (offer.status === 'pending' && offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
                estadoTexto = 'Expirada';
                estadoColor = 'red.500';
              } else if (offer.status === 'pending') {
                estadoTexto = 'Pendiente';
              } else if (offer.status === 'accepted') {
                estadoTexto = 'Aceptada';
              } else if (offer.status === 'rejected') {
                estadoTexto = 'Rechazada';
              } else {
                estadoTexto = offer.status;
              }
              return (
                <Box key={offer.id} p={4} borderWidth={1} borderRadius="16px" borderColor="#00345933" bg="#fff" boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap="16px">
                  <Box textAlign="left">
                    <Text fontWeight="bold" color="#003459">Asset: {offer.asset?.name || 'N/A'}</Text>
                    <Text color="#003459">Propietario del Asset de la oferta: {offer.assetOwnerAtTimeOfOffer?.name || 'N/A'}</Text>
                    <Text color="#003459">Cantidad ofertada: <b>{Number(offer.offerPrice) % 1 === 0 ? Number(offer.offerPrice) : Number(offer.offerPrice).toFixed(2)} RTM</b></Text>
                    <Text color={estadoColor} fontWeight="bold">Estado: <b>{estadoTexto}</b></Text>
                    {offer.expiresAt && !(offer.status === 'pending' && new Date(offer.expiresAt) < new Date()) && (
                      <Text color="#949494" fontSize="sm">
                        {`Fecha de Expiración: ${new Date(offer.expiresAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}`}
                      </Text>
                    )}
                  </Box>
                  <VStack spacing={2} align="end">
                    {offer.status === 'pending' && (!offer.expiresAt || new Date(offer.expiresAt) >= new Date()) && (
                      <Button
                        bg="red.500"
                        color="#fff"
                        borderRadius="10px"
                        border="2px solid #003459"
                        width="120px"
                        isLoading={actionLoading === offer.id}
                        onClick={() => handleCancelSentOffer(offer.id)}
                        _hover={{ bg: 'red.600' }}
                      >Cancelar</Button>
                    )}
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
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default Offers;
