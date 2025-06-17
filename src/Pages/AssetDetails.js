import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Box, Heading, Image, Text, Spinner, Center, Button, Input, VStack, DialogRoot, DialogTrigger, DialogBackdrop, DialogPositioner, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger, DialogTitle } from '@chakra-ui/react';

const getAsset = async (id) => {
  try {
    const response = await fetch('http://localhost:3000/asset/' + id);
    if (!response.ok) {
      throw new Error('Error al obtener los activos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assets:', error);
    return null;
  }
};

const AssetDetail = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [userBalance, setUserBalance] = useState(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [message, setMessage] = useState('');
  const [rtmToUsdRate, setRtmToUsdRate] = useState(null); // State for RTM to USD rate
  const [isFetchingRate, setIsFetchingRate] = useState(false); // State for rate fetching
  const [offerAmount, setOfferAmount] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

  const fetchLoggedInUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Fetch user info to get the ID, similar to Account.js
        const response = await fetch('http://localhost:3000/user/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: decodedToken.email }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.id) {
            setLoggedInUserId(data.user.id);
          }
        } else {
          console.error('Failed to fetch user info for Home page');
        }
      } catch (error) {
        console.error('Error fetching logged-in user ID for Home page:', error);
      }
    }
  };

  const sendAsset = async () => {
    if (!destinationAddress.trim()) {
      alert('Por favor, ingresa una dirección de destino válida.');
      return;
    }

    // Ensure asset and asset.asset_id are available
    if (!asset || !asset.asset_id) {
      console.error('Asset data or asset_id is missing for sending.');
      alert('No se pudo obtener la información necesaria del asset para el envío.');
      return;
    }

    console.log('Intentando enviar asset (ticker):', asset.asset_id, 'a la dirección:', destinationAddress);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión para enviar el asset.');
        return;
      }

      const url = `http://localhost:3000/assets/send`;
      console.log('URL de envío:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetTicker: asset.name,
          toAddress: destinationAddress,
        }),
      });


      console.log('Respuesta recibida del envío:', response);
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Could not parse JSON response:", e);
        if (!response.ok) {
          const errorText = await response.text();
          responseData = { message: errorText || "Error en la respuesta del servidor." };
        }
      }


      if (response.ok) {
        console.log('Envío exitoso, respuesta backend:', responseData);
        alert('Envío exitoso: ' + (responseData.message || "El asset ha sido enviado correctamente. TXID: " + responseData.txid));
        setDestinationAddress('');
        getAsset(id).then(setAsset);



      } else {
        console.log('Error en el envío, status:', response.status, 'responseData:', responseData);
        alert('Error en el envío: ' + (responseData.message || `Error ${response.status}`));
      }
    } catch (err) {
      console.log('Error de red o servidor al intentar enviar el asset:', err);
      alert('Error de red o servidor al intentar enviar el asset.');
    }
  };

  const buyAsset = async () => {
    console.log('Intentando comprar asset con id:', asset.id);
    if (loading) return;

    try {
      if (window.confirm(`¿Estás seguro de que deseas comprar este asset? Se descontará/n ${asset.price} RTM de tu balance.`)) {
        console.log('Compra confirmada.');
      } else {
        console.log('Compra cancelada.');
        return;
      }

      setMessage("Proceso de compra en curso...\nEspere unos minutos antes de recargar la página.");
      const token = localStorage.getItem('token');
      console.log('Token recuperado:', token);
      const url = `http://localhost:3000/assets/buy/${asset.id}`;
      console.log('URL de compra:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // Puedes añadir datos extra si es necesario
      });
      console.log('Respuesta recibida:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Compra exitosa, respuesta backend:', data);
        alert('¡Compra realizada con éxito!');
      } else {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.log('No se pudo parsear el error JSON:', e);
        }
        console.log('Error en la compra, status:', response.status, 'errorData:', errorData);
        alert('Error al realizar la compra: ' + (errorData.message || 'Error desconocido'));
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula un retraso de 2 segundos para la compra


    } catch (err) {
      console.log('Error de red o servidor al intentar comprar el asset:', err);
      setMessage("Error de red o servidor al intentar comprar el asset.");
      alert('Error de red o servidor al intentar comprar el asset.');
    } finally {
      setLoading(false);
    }
  }

  const fetchUserBalance = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsCheckingBalance(true);
      try {
        const response = await fetch('http://localhost:3000/user/balance', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.balanceRTM !== undefined) {
            setUserBalance(data.balanceRTM);
          } else {
            setUserBalance(null); // Or some error state
            console.error('Balance RTM not found in response');
          }
        } else {
          console.error('Failed to fetch user balance');
          setUserBalance(null);
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
        setUserBalance(null);
      } finally {
        setIsCheckingBalance(false);
      }
    } else {
      setUserBalance(null); // No token, no balance
    }
  };

  const fetchRtmToUsdRate = async () => {
    setIsFetchingRate(true);
    // Use your backend endpoint
    const url = `http://localhost:3000/get-rtm-price`;

    try {
      // No API key or special headers needed for this call to your backend
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // If your backend endpoint for getting the price requires authentication,
          // you might need to add an Authorization header here, e.g.:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Expecting format: { "usd_price": 0.000288... }
        if (data.usd_price !== undefined) {
          setRtmToUsdRate(data.usd_price);
        } else {
          console.error('Could not find usd_price in backend response:', data);
          setRtmToUsdRate(null);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch RTM to USD rate from backend and could not parse error response.' }));
        console.error('Failed to fetch RTM to USD rate from backend:', response.status, errorData);
        setRtmToUsdRate(null);
      }
    } catch (error) {
      console.error('Error fetching RTM to USD rate from backend:', error);
      setRtmToUsdRate(null);
    } finally {
      setIsFetchingRate(false);
    }
  };

  // Función para enviar la oferta (deberás implementar el endpoint en backend)
  const handleSendOffer = async () => {
    if (!offerAmount || isNaN(offerAmount) || Number(offerAmount) <= 0) {
      setOfferMessage('Introduce una cantidad válida.');
      return;
    }
    setOfferLoading(true);
    setOfferMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/assets/offer/${asset.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: offerAmount }),
        }
      );
      if (response.ok) {
        setOfferMessage('¡Oferta enviada correctamente! El propietario será notificado.');
        setOfferAmount('');
      } else {
        const data = await response.json().catch(() => ({}));
        setOfferMessage(data.message || 'Error al enviar la oferta.');
      }
    } catch (err) {
      setOfferMessage('Error de red o servidor al enviar la oferta.');
    } finally {
      setOfferLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLoggedInUser();
    fetchUserBalance();
    fetchRtmToUsdRate(); // Fetch conversion rate

    getAsset(id).then((data) => {
      setAsset(data);
      setLoading(false);
    });
  }, [id]);

  const isOwner = loggedInUserId && asset && asset.Wallet && String(loggedInUserId) === String(asset.Wallet.UsuarioId);

  if (loading) {
    return (
      <Center mt={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!asset) return <Text>Asset no encontrado</Text>;


  // Compatibilidad para diferentes nombres de campos
  const nombre = asset.nombre || asset.name || 'Sin nombre';
  const precio = asset.precio || asset.price || null;
  const referenceHash = asset.referenceHash || asset.hash || null;
  const assetImage = referenceHash
    ? "https://ipfsweb.raptoreum.com/ipfs/" + referenceHash
    : asset.image || '';
  const descripcion = asset.description || asset.descripcion || '';
  const canAfford = userBalance !== null && precio !== null && userBalance >= parseFloat(precio);
  const showInsufficientBalanceMessage = !isOwner && userBalance !== null && precio !== null && !canAfford;

  let usdPrice = null;
  if (precio && rtmToUsdRate) {
    const calculatedUsdPrice = parseFloat(precio) * rtmToUsdRate;
    if (calculatedUsdPrice < 5) {
      usdPrice = calculatedUsdPrice.toFixed(4); // Show 4 decimal places if less than 5 USD
    } else {
      usdPrice = calculatedUsdPrice.toFixed(2); // Otherwise, show 2 decimal places
    }
  }

  return (
    <Box className="asset-card" style={{ border: '3px solid #003459', borderRadius: '24px', background: '#fff', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459', transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1), transform 0.2s', padding: 0, margin: '32px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', overflow: 'hidden' }}>
      {assetImage && (
        <Box display="flex" alignItems="center" justifyContent="center" gap="100px" height="320px" width="100%" bg="#f7fafc" style={{ borderTopLeftRadius: '21px', borderTopRightRadius: '21px', overflow: 'visible', margin: 0, padding: 0, position: 'relative' }}>
          <Image
            src={assetImage}
            alt={nombre}
            width="auto"
            height="300px"
            maxW="100%"
            borderRadius="16px"
            boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)"
            background="#f7fafc"
            display="block"
            objectFit="contain"
            transition="transform 0.35s cubic-bezier(.25,.8,.25,1), box-shadow 0.3s"
            style={{ margin: '0 auto', position: 'relative', transformOrigin: 'center top' }}
            _hover={{ transform: 'scale(1.5)', zIndex: 10, boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459' }}
          />
        </Box>
      )}
      <Box p={6} width="100%" textAlign="center" bg="#f7fafc" display="flex" flexDirection="column" alignContent="center" alignItems="center" gap="10px" style={{ borderBottomLeftRadius: '21px', borderBottomRightRadius: '21px' }}>
        <Heading color="#003459">{nombre}</Heading>
        {asset.asset_id && (
          <Text color="gray.500" fontSize="sm" mt={2}>
            {asset.asset_id}
          </Text>
        )}
        {asset.ownerName && asset.Wallet.direccion && (
          <Text color="gray.600" fontSize="md" mt={1}>
            Propietario: {asset.ownerName} -  {asset.Wallet.direccion}
          </Text>
        )}
        {precio && (
          <Text style={{ color: '#007ea7', fontWeight: 'bold' }} fontSize="xl" mt={2}>
            Precio: {precio} RTM
            {isFetchingRate && <Spinner size="xs" ml={2} />}
            {usdPrice && !isFetchingRate && ` (${usdPrice} USD)`}
            {!rtmToUsdRate && !isFetchingRate && precio !== null && (
              <Text as="span" fontSize="sm" color="gray.500" ml={1}>(No se pudo cargar precio en USD)</Text>
            )}
          </Text>
        )}
        {descripcion && (
          <Text mt={2} fontSize="md" color="gray.700">{descripcion}</Text>
        )}
        {isOwner && (
          <VStack spacing={4} mt={4} align="stretch">
            <Text fontSize="md" color="green.600" fontWeight="bold" mb="6">¡Eres el dueño de este asset!</Text>
            <Input
              placeholder="Dirección de destino Raptoreum"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              borderColor="#003459"
              focusBorderColor="#007ea7"
            />
            <Text fontSize="sm" color="red.600" fontWeight="bold">Si lo transfieres, el asset desaparecerá de la wallet del sistema</Text>
            <Button
              bg="#003459"
              color="#fff"
              borderRadius="10px"
              width="50%"
              alignSelf="center"
              onClick={sendAsset}
              _hover={{ bg: '#005080' }}
            >
              Enviar Asset
            </Button>
          </VStack>
        )}
        {!isOwner && (
          <Center flexDirection="column" width="100%">
            {message && (
              <Text color="blue.500" fontWeight="bold" mb={2} mt={5} whiteSpace="pre-line">
                {message}
              </Text>
            )}
            <Button
              bg="#003459"
              color="#fff"
              borderRadius="10px"
              width="50%"
              mt={4}
              onClick={buyAsset}
              disabled={message || !asset || isCheckingBalance || userBalance === null || precio === null || !canAfford}
              _hover={{ bg: '#005080' }}
              alignSelf="center"
            >
              {isCheckingBalance ? <Spinner size="sm" /> : 'Comprar Asset'}
            </Button>
            {/* Dialog para hacer oferta usando Chakra UI v3 */}
            <DialogRoot open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  bg="#003459"
                  color="#fff"
                  borderRadius="10px"
                  width="50%"
                  mt={2}
                  onClick={() => setIsOfferDialogOpen(true)}
                  _hover={{ bg: '#007ea7' }}
                  alignSelf="center"
                >
                  Hacer Oferta
                </Button>
              </DialogTrigger>
              <DialogBackdrop />
              <DialogPositioner>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hacer una Oferta</DialogTitle>
                    <DialogCloseTrigger asChild>
                      <Button variant="ghost" size="sm" float="right">Cerrar</Button>
                    </DialogCloseTrigger>
                  </DialogHeader>
                  <DialogBody>
                    <Box mb={3}>
                      <label style={{ fontWeight: 'bold' }}>Cantidad ofertada (RTM)</label>
                      <Input
                        type="number"
                        value={offerAmount}
                        onChange={e => setOfferAmount(e.target.value)}
                        placeholder="Introduce tu oferta"
                        mt={2}
                      />
                    </Box>
                    {offerMessage && (
                      <Text color={offerMessage.startsWith('¡') ? 'green.500' : 'red.500'} mt={2}>{offerMessage}</Text>
                    )}
                  </DialogBody>
                  <DialogFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSendOffer} isLoading={offerLoading}>
                      Enviar Oferta
                    </Button>
                    <DialogCloseTrigger asChild>
                      <Button variant="ghost">Cancelar</Button>
                    </DialogCloseTrigger>
                  </DialogFooter>
                </DialogContent>
              </DialogPositioner>
            </DialogRoot>
            {showInsufficientBalanceMessage && (
              <Text color="red.500" mt={2} fontWeight="bold">
                No tienes saldo suficiente. (Tu saldo: {userBalance} RTM)
              </Text>
            )}
            {userBalance === null && !isCheckingBalance && loggedInUserId && (
              <Text color="orange.500" mt={2}>
                No se pudo verificar tu saldo. Intenta recargar.
              </Text>
            )}
          </Center>
        )}
        {/* Sección de enlaces a RRSS de Unknown Gravity con iconos mejorados y más reconocibles */}
        <Box mt={6} mb={2} display="flex" flexDirection="row" justifyContent="center" gap="22px" alignItems="center">
          <a href="https://www.unknowngravity.com/" target="_blank" rel="noopener noreferrer" title="Web">
            {/* Icono Web (globo) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#003459" strokeWidth="2.5"/><ellipse cx="16" cy="16" rx="6" ry="14" stroke="#003459" strokeWidth="2.5"/><path d="M2 16h28" stroke="#003459" strokeWidth="2.5"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/unknowngravity" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            {/* Icono LinkedIn mejorado (cuadro + 'in') */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="5" fill="#003459"/><text x="10" y="23" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="14" fill="#fff">in</text></svg>
          </a>
          <a href="https://twitter.com/unknowngravity_" target="_blank" rel="noopener noreferrer" title="Twitter">
            {/* Icono Twitter (pájaro) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M28 10.5c-.8.4-1.6.7-2.4.8.9-.6 1.5-1.3 1.8-2.2-.9.5-1.8.9-2.7 1.1-1-1-2.3-1.3-3.6-.9-1.8.5-2.9 2.4-2.4 4.2-3.6-.1-6.8-1.9-9-4.6-.4.8-.5 1.7-.3 2.6.4.9 1.1 1.6 2 2-.7 0-1.4-.2-2-.5v.1c0 2 1.4 3.7 3.2 4.1-.5.2-1.1.2-1.6.1.4 1.4 1.8 2.4 3.3 2.4-1.3 1-2.9 1.6-4.5 1.6-.3 0-.6 0-.9-.1C8.7 25 11 25.7 13.5 25.7c8.2 0 12.7-6.7 12.7-12.7v-.5c1-.7 1.7-1.5 2.3-2.3z" fill="#003459"/></svg>
          </a>
          <a href="https://www.instagram.com/unknown.gravity/" target="_blank" rel="noopener noreferrer" title="Instagram">
            {/* Icono Instagram (cámara) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="7" stroke="#003459" strokeWidth="2.5" fill="none"/><circle cx="16" cy="16" r="7" stroke="#003459" strokeWidth="2.5" fill="none"/><circle cx="23" cy="9" r="1.5" fill="#003459"/></svg>
          </a>
          <a href="https://www.tiktok.com/@unknown.gravity" target="_blank" rel="noopener noreferrer" title="TikTok">
            {/* Icono TikTok mejorado (nota musical doble trazo) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="7" fill="#003459"/><path d="M22 11v8a5 5 0 1 1-5-5" stroke="#fff" strokeWidth="2.5" fill="none"/><path d="M22 11c1.2 0 2.2-1 2.2-2.2S23.2 6.6 22 6.6" stroke="#fff" strokeWidth="1.2" fill="none"/><circle cx="22" cy="11" r="1.5" fill="#fff"/></svg>
          </a>
        </Box>
      </Box>
    </Box>
  );
};

export default AssetDetail;