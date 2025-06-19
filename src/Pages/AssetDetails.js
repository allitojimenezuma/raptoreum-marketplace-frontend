import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Box, Heading, Image, Text, Spinner, Center, Button, Input, VStack, DialogRoot, DialogTrigger, DialogBackdrop, DialogPositioner, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger, DialogTitle, Textarea, HStack, IconButton, Grid } from '@chakra-ui/react';

import { toaster } from '../Components/ui/toaster';

const getAsset = async (id) => {
  try {
    const response = await fetch('https://rtm.api.test.unknowngravity.com/asset/' + id);
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
  const navigate = useNavigate(); // <-- Añadido para redirección
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
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [offerExpiresAt, setOfferExpiresAt] = useState('');
  const [showEditPrice, setShowEditPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [showSendFields, setShowSendFields] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const fetchLoggedInUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Fetch user info to get the ID, similar to Account.js
        const response = await fetch('https://rtm.api.test.unknowngravity.com/user/info', {
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
      toaster.create({ title: 'Por favor, ingresa una dirección de destino válida.', type: 'error', duration: 10000, bg: '#003459', color: 'white', borderColor: '#003459', borderWidth: '1px' });
      return;
    }

    if (!asset || !asset.asset_id) {
      console.error('Asset data or asset_id is missing for sending.');
      toaster.create({ title: 'No se pudo obtener la información necesaria del asset para el envío.', type: 'error', duration: 10000, bg: '#003459', color: 'white', borderColor: '#003459', borderWidth: '1px' });
      return;
    }

    // Guardar el id del toaster de loading
    const loadingToastId = toaster.create({ title: 'Procesando transferencia...', description: 'Por favor, espera mientras se transfiere el asset.', type: 'loading', duration: 10000, bg: '#003459', color: 'white', borderColor: '#003459', borderWidth: '1px' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toaster.create({ title: 'No estás autenticado. Por favor, inicia sesión para enviar el asset.', type: 'error', duration: 10000, bg: '#003459', color: 'white', borderColor: '#003459', borderWidth: '1px' });
        toaster.dismiss(loadingToastId); // Cerrar loading si hay error
        return;
      }

      const url = `https://rtm.api.test.unknowngravity.com/assets/send`;
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

      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        if (!response.ok) {
          const errorText = await response.text();
          responseData = { message: errorText || "Error en la respuesta del servidor." };
        }
      }

      toaster.dismiss(loadingToastId); // Cerrar loading al recibir respuesta

      if (response.ok) {
        toaster.create({ title: 'Envío exitoso', description: responseData.message || `El asset ha sido enviado correctamente. TXID: ${responseData.txid}`, type: 'success', duration: 10000, bg: '#003459', color: 'white', borderColor: '#003459', borderWidth: '1px' });
        setDestinationAddress('');
        // Redirigir a Account.js tras un pequeño delay para que el usuario vea el toaster
        setTimeout(() => navigate('/account'), 1500);
      } else {
        toaster.create({ title: 'Error en el envío', description: responseData.message || `Error ${response.status}`, type: 'error', duration: 10000, bg: '#003459', color: 'white', borderColor: '#003459', borderWidth: '1px' });
      }
    } catch (err) {
      toaster.dismiss(loadingToastId); // Cerrar loading si hay error
      toaster.create({ title: 'Error de red o servidor al intentar enviar el asset.', type: 'error', duration: 10000, bg: '#003459', color: 'white', borderColor: '#003459', borderWidth: '1px' });
    }
  };

  const buyAsset = async () => {
    if (loading || isBuying) return;
    setIsBuying(true);
    try {
      if (window.confirm(`¿Estás seguro de que deseas comprar este asset? Se descontará/n ${asset.price} RTM de tu balance.`)) {
        console.log('Compra confirmada.');
      } else {
        setIsBuying(false);
        return;
      }
      toaster.create({ title: 'Proceso de compra en curso', description: 'Espere unos minutos antes de recargar la página.', type: 'info', duration: 12000 });
      // setMessage eliminado, solo toaster
      const token = localStorage.getItem('token');
      console.log('Token recuperado:', token);
      const url = `https://rtm.api.test.unknowngravity.com/assets/buy/${asset.id}`;
      console.log('URL de compra:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      console.log('Respuesta recibida:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Compra exitosa, respuesta backend:', data);
        toaster.create({ title: '¡Compra realizada con éxito!', type: 'success', duration: 10000 });
      } else {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.log('No se pudo parsear el error JSON:', e);
        }
        console.log('Error en la compra, status:', response.status, 'errorData:', errorData);
        toaster.create({ title: 'Error al realizar la compra', description: errorData.message || 'Error desconocido', type: 'error', duration: 10000 });
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula un retraso de 2 segundos para la compra


    } catch (err) {
      console.log('Error de red o servidor al intentar comprar el asset:', err);
      setMessage("Error de red o servidor al intentar comprar el asset.");
      toaster.create({ title: 'Error de red o servidor al intentar comprar el asset.', type: 'error', duration: 10000 });
    } finally {
      setLoading(false);
      setIsBuying(false);
    }
  }

  const fetchUserBalance = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsCheckingBalance(true);
      try {
        const response = await fetch('https://rtm.api.test.unknowngravity.com/user/balance', {
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
    const url = `https://rtm.api.test.unknowngravity.com/get-rtm-price`;

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


  const handleSendOffer = async () => {
    if (!offerAmount || isNaN(offerAmount) || Number(offerAmount) <= 0) {
      // toast.error('Introduce una cantidad válida para la oferta.', { title: 'Error de Oferta' });
      return;
    }
    if (!asset || !asset.id) {
      // toast.error('No se pudo obtener la información del asset para la oferta.', { title: 'Error de Asset' });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      // toast.error('No estás autenticado. Por favor, inicia sesión.', { title: 'Error de Autenticación' });
      return;
    }

    const requestBody = {
      assetId: asset.id, // Use the database ID of the asset
      offerPrice: parseFloat(offerAmount),
    };

    // Si el usuario no introduce fecha de expiración, se pone 24h desde ahora
    if (offerExpiresAt) {
      requestBody.expiresAt = offerExpiresAt;
    } else {
      // 24 horas desde ahora en formato ISO
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      requestBody.expiresAt = expires;
    }

    setOfferLoading(true); // Keep this for the button's loading state


    const apiCall = fetch(`https://rtm.api.test.unknowngravity.com/offers/makeOffer`, { // Updated endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    }).then(async (response) => {
      const data = await response.json().catch(() => ({ message: "Error en la respuesta del servidor." }));
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }
      return data;
    });

    toaster.promise(apiCall, {
      loading: 'Enviando oferta...',
      success: (data) => {
        setOfferAmount('');
        setOfferExpiresAt('');
        setIsOfferDialogOpen(false);
        return { title: data.message || '¡Oferta enviada correctamente!' };
      },
      error: (err) => {
        return { title: err.message || 'Error al enviar la oferta.' };
      },
    });

    // The finally block for setOfferLoading is handled by the promise toast completion
    // apiCall.finally(() => {
    //   setOfferLoading(false);
    // });
  };

  // Handler para actualizar el precio
  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(newPrice) || Number(newPrice) < 0) {
      toaster.create({ title: 'Introduce un precio válido.', type: 'error', duration: 6000 });
      return;
    }
    setIsUpdatingPrice(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://rtm.api.test.unknowngravity.com/assets/updatePrice/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ precio: newPrice }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el precio');
      }
      toaster.create({ title: data.message || 'Precio actualizado correctamente', type: 'success', duration: 6000 });
      setShowEditPrice(false);
      setAsset({ ...asset, precio: newPrice, price: newPrice });
    } catch (err) {
      toaster.create({ title: err.message || 'Error al actualizar el precio', type: 'error', duration: 6000 });
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Handler to update the description
  const handleUpdateDescription = async () => {
    if (newDescription.trim() === '') {
      toaster.create({ title: 'La descripción no puede estar vacía.', type: 'error', duration: 6000 });
      return;
    }
    setIsUpdatingDescription(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://rtm.api.test.unknowngravity.com/assets/updateDescription/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: newDescription }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la descripción');
      }
      toaster.create({ title: data.message || 'Descripción actualizada correctamente', type: 'success', duration: 6000 });
      setShowEditDescription(false);
      // Update local state to show the change immediately
      setAsset({ ...asset, description: newDescription, descripcion: newDescription });
    } catch (err) {
      toaster.create({ title: err.message || 'Error al actualizar la descripción', type: 'error', duration: 6000 });
    } finally {
      setIsUpdatingDescription(false);
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
        {/* Grid SIEMPRE visible, 3 filas x 2 columnas, cada celda cambia según estado */}
        <Box width="100%" mt={2}>
          <Grid templateColumns={isOwner ? "1fr 180px" : "1fr"} gap={2} alignItems="center" width="100%">
            {/* Fila 1: Precio y Modificar Precio */}
            {showEditPrice ? (
              <>
                <Box gridColumn="1 / span 2" textAlign="center">
                  <Text style={{ color: '#007ea7', fontWeight: 'bold' }} fontSize="xl">
                    Precio: {precio} RTM
                    {isFetchingRate && <Spinner size="xs" ml={2} />}
                    {usdPrice && !isFetchingRate && ` (${usdPrice} USD)`}
                    {!rtmToUsdRate && !isFetchingRate && precio !== null && (
                      <Text as="span" fontSize="sm" color="gray.500" ml={1}>(No se pudo cargar precio en USD)</Text>
                    )}
                  </Text>
                </Box>
                <Box gridColumn="1 / span 2" mt={2}>
                  <VStack spacing={2} align="center" width="100%">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      placeholder="Nuevo precio (RTM)"
                      borderColor="#003459"
                      focusBorderColor="#007ea7"
                      color="#003459"
                      width="110px"
                      fontSize="md"
                      textAlign="center"
                    />
                    <HStack justifyContent="center">
                      <Button
                        bg="#003459"
                        color="#fff"
                        borderRadius="10px"
                        isLoading={isUpdatingPrice}
                        onClick={handleUpdatePrice}
                        _hover={{ bg: '#005080' }}
                        width="120px"
                        fontSize="sm"
                        height="40px"
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="ghost"
                        color="#003459"
                        borderRadius="10px"
                        bg="#fff"
                        border="1px solid #003459"
                        onClick={() => { setShowEditPrice(false); setNewPrice(precio); }}
                        fontSize="sm"
                        height="40px"
                        width="120px"
                        _hover={{ bg: '#e2e8f0' }}
                      >
                        Cancelar
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </>
            ) : (
              <>
                <Box textAlign="center">
                  <Text style={{ color: '#007ea7', fontWeight: 'bold' }} fontSize="xl">
                    Precio: {precio} RTM
                    {isFetchingRate && <Spinner size="xs" ml={2} />}
                    {usdPrice && !isFetchingRate && ` (${usdPrice} USD)`}
                    {!rtmToUsdRate && !isFetchingRate && precio !== null && (
                      <Text as="span" fontSize="sm" color="gray.500" ml={1}>(No se pudo cargar precio en USD)</Text>
                    )}
                  </Text>
                </Box>
                <Box>
                  {isOwner && (
                    <Button
                      bg="#003459"
                      color="#fff"
                      borderRadius="10px"
                      fontSize="sm"
                      width="160px"
                      height="40px"
                      mb={2}
                      onClick={() => { setShowEditPrice(true); setNewPrice(precio); }}
                      _hover={{ bg: '#005080' }}
                    >
                      Modificar Precio
                    </Button>
                  )}
                </Box>
              </>
            )}
            {/* Fila 2: Descripción y Editar Descripción */}
            {showEditDescription ? (
              <>
                <Box gridColumn="1 / span 2" textAlign="center">
                  <Text fontSize="md" color="gray.700">Descripción: {descripcion || 'Sin descripción.'}</Text>
                </Box>
                <Box gridColumn="1 / span 2" mt={2}>
                  <VStack spacing={2} align="center" width="100%">
                    <Textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Nueva descripción"
                      borderColor="#003459"
                      focusBorderColor="#007ea7"
                      color="#003459"
                    />
                    <HStack justifyContent="center">
                      <Button
                        bg="#003459"
                        color="#fff"
                        borderRadius="10px"
                        isLoading={isUpdatingDescription}
                        onClick={handleUpdateDescription}
                        _hover={{ bg: '#005080' }}
                        size="sm"
                        height="40px"
                        width="120px"
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="ghost"
                        color="#003459"
                        borderRadius="10px"
                        bg="#fff"
                        border="1px solid #003459"
                        onClick={() => setShowEditDescription(false)}
                        size="sm"
                        height="40px"
                        width="120px"
                        _hover={{ bg: '#e2e8f0' }}
                      >
                        Cancelar
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </>
            ) : (
              <>
                <Box textAlign="center">
                  <Text fontSize="md" color="gray.700">Descripción: {descripcion || 'Sin descripción.'}</Text>
                </Box>
                <Box>
                  {isOwner && (
                    <Button
                      bg="#003459"
                      color="#fff"
                      borderRadius="10px"
                      fontSize="sm"
                      width="160px"
                      height="40px"
                      mb={2}
                      onClick={() => {
                        setShowEditDescription(true);
                        setNewDescription(descripcion);
                      }}
                      _hover={{ bg: '#005080' }}
                    >
                      Editar Descripción
                    </Button>
                  )}
                </Box>
              </>
            )}
            {/* Fila 3: Mensaje de dueño y Enviar Asset */}
            {!showSendFields ? (
              <>
                {isOwner && (
                  <>
                    <Box textAlign="center">
                      <Text fontSize="md" color="green.600" fontWeight="bold">¡Eres el dueño de este asset!</Text>
                    </Box>
                    <Box>
                      <Button
                        bg="#003459"
                        color="#fff"
                        borderRadius="10px"
                        width="160px"
                        height="40px"
                        onClick={() => setShowSendFields(true)}
                        _hover={{ bg: '#005080' }}
                      >
                        Enviar Asset
                      </Button>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <>
                <Box gridColumn="1 / span 2" textAlign="center">
                  <Box width="100%" display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Input
                      placeholder="Dirección de destino Raptoreum"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      borderColor="#003459"
                      focusBorderColor="#007ea7"
                      mb={2}
                    />
                    <Text fontSize="sm" color="red.600" fontWeight="bold">Si lo transfieres, el asset desaparecerá de la wallet del sistema</Text>
                  </Box>
                </Box>
                <Box gridColumn="1 / span 2" mt={2}>
                  <HStack mt={2} width="100%" justifyContent="center">
                    <Button
                      bg="#003459"
                      color="#fff"
                      borderRadius="10px"
                      width="120px"
                      onClick={() => setShowConfirmDialog(true)}
                      _hover={{ bg: '#005080' }}
                      height="40px"
                    >
                      Enviar Asset
                    </Button>
                    <Button
                      variant="ghost"
                      color="#003459"
                      borderRadius="10px"
                      bg="#fff"
                      border="1px solid #003459"
                      width="120px"
                      onClick={() => { setShowSendFields(false); setDestinationAddress(''); }}
                      height="40px"
                      _hover={{ bg: '#e2e8f0' }}
                    >
                      Cancelar
                    </Button>
                  </HStack>
                  {/* Dialog de confirmación usando Chakra UI v3 */}
                  <DialogRoot open={showConfirmDialog} onOpenChange={(details) => setShowConfirmDialog(details.open)}>
                    <DialogPositioner>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle style={{ color: '#003459' }}>¿Confirmar envío?</DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                          <Text>¿Estás seguro de que deseas transferir este asset a la dirección indicada?</Text>
                          <Text fontWeight="bold" color="#003459" mt={2}>{destinationAddress}</Text>
                        </DialogBody>
                        <DialogFooter>
                          <Button
                            bg="#003459"
                            color="#fff"
                            borderRadius="10px"
                            mr={3}
                            onClick={() => { setShowConfirmDialog(false); sendAsset(); }}
                            _hover={{ bg: '#005080' }}
                            height="40px"
                            width="120px"
                          >
                            Sí, enviar
                          </Button>
                          <Button
                            variant="ghost"
                            color="#003459"
                            borderRadius="10px"
                            bg="#fff"
                            border="1px solid #003459"
                            borderRadius="10px"
                            onClick={() => setShowConfirmDialog(false)}
                            height="40px"
                            width="120px"
                            _hover={{ bg: '#e2e8f0' }}
                          >
                            Cancelar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </DialogPositioner>
                  </DialogRoot>
                </Box>
              </>
            )}
          </Grid>
        </Box>
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
              disabled={isBuying || message || !asset || isCheckingBalance || userBalance === null || precio === null || !canAfford}
              _hover={{ bg: '#005080' }}
              alignSelf="center"
              opacity={isBuying ? 0.6 : 1}
              height="40px"
            >
              {isBuying ? <Spinner size="sm" /> : isCheckingBalance ? <Spinner size="sm" /> : 'Comprar Asset'}
            </Button>
            {/* Dialog para hacer oferta usando Chakra UI v3 */}
            <DialogRoot open={isOfferDialogOpen}
              onOpenChange={(details) => setIsOfferDialogOpen(details.open)}
            >
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
                  height="40px"
                >
                  Hacer Oferta
                </Button>
              </DialogTrigger>

              <DialogBackdrop />

              <DialogPositioner>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle style={{ color: '#003459' }}>Hacer una Oferta</DialogTitle>
                    <DialogCloseTrigger>
                      <Button variant="ghost" size="sm" float="right" color="#003459" _hover={{ bg: '#e2e8f0' }} height="40px" width="120px">Cancelar</Button>
                    </DialogCloseTrigger>
                  </DialogHeader>
                  <DialogBody>
                    <Box mb={3}>
                      <label style={{ fontSize: '1.25rem', fontWeight: 'normal', color: '#003459' }}>Cantidad ofertada (RTM)</label>
                      <Input
                        type="number"
                        value={offerAmount}
                        onChange={e => setOfferAmount(e.target.value)}
                        placeholder="Introduce tu oferta"
                        mt={2}
                        borderColor="#003459"
                        focusBorderColor="#007ea7"
                        color="#003459"
                      />
                    </Box>
                  </DialogBody>
                  <DialogFooter>
                    <Box width="100%" display="flex" justifyContent="center">
                      <Button
                        bg="#003459"
                        color="#fff"
                        borderRadius="10px"
                        width="50%"
                        mr={3}
                        onClick={handleSendOffer}
                        isLoading={offerLoading}
                        _hover={{ bg: '#005080' }}
                        height="40px"
                      >
                        Enviar Oferta
                      </Button>
                    </Box>
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
        <Center flexDirection="column" width="100%">

          <Button
            bg="#003459"
            color="#fff"
            borderRadius="10px"
            width={{ base: '95%', sm: '70%', md: '50%' }}
            onClick={() => navigate(`/asset/${asset.asset_id}/history`)}
            isLoading={offerLoading}
            _hover={{ bg: '#005080' }}
            height="40px"
          >
            Ver historial de este asset
          </Button>

        </Center>


        {/* Sección de enlaces a RRSS de Unknown Gravity con iconos mejorados y más reconocibles */}
        <Box mt={6} mb={2} display="flex" flexDirection="row" justifyContent="center" gap="22px" alignItems="center">
          <a href="https://www.unknowngravity.com/" target="_blank" rel="noopener noreferrer" title="Web">
            {/* Icono Web (globo) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#003459" strokeWidth="2.5" /><ellipse cx="16" cy="16" rx="6" ry="14" stroke="#003459" strokeWidth="2.5" /><path d="M2 16h28" stroke="#003459" strokeWidth="2.5" /></svg>
          </a>
          <a href="https://www.linkedin.com/company/unknowngravity" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            {/* Icono LinkedIn mejorado (cuadro + 'in') */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="5" fill="#003459" /><text x="10" y="23" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="14" fill="#fff">in</text></svg>
          </a>
          <a href="https://twitter.com/unknowngravity_" target="_blank" rel="noopener noreferrer" title="Twitter">
            {/* Icono Twitter (pájaro) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M28 10.5c-.8.4-1.6.7-2.4.8.9-.6 1.5-1.3 1.8-2.2-.9.5-1.8.9-2.7 1.1-1-1-2.3-1.3-3.6-.9-1.8.5-2.9 2.4-2.4 4.2-3.6-.1-6.8-1.9-9-4.6-.4.8-.5 1.7-.3 2.6.4.9 1.1 1.6 2 2-.7 0-1.4-.2-2-.5v.1c0 2 1.4 3.7 3.2 4.1-.5.2-1.1.2-1.6.1.4 1.4 1.8 2.4 3.3 2.4-1.3 1-2.9 1.6-4.5 1.6-.3 0-.6 0-.9-.1C8.7 25 11 25.7 13.5 25.7c8.2 0 12.7-6.7 12.7-12.7v-.5c1-.7 1.7-1.5 2.3-2.3z" fill="#003459" /></svg>
          </a>
          <a href="https://www.instagram.com/unknown.gravity/" target="_blank" rel="noopener noreferrer" title="Instagram">
            {/* Icono Instagram (cámara) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="7" stroke="#003459" strokeWidth="2.5" fill="none" /><circle cx="16" cy="16" r="7" stroke="#003459" strokeWidth="2.5" fill="none" /><circle cx="23" cy="9" r="1.5" fill="#003459" /></svg>
          </a>
          <a href="https://www.tiktok.com/@unknown.gravity" target="_blank" rel="noopener noreferrer" title="TikTok">
            {/* Icono TikTok mejorado (nota musical doble trazo) */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="7" fill="#003459" /><path d="M22 11v8a5 5 0 1 1-5-5" stroke="#fff" strokeWidth="2.5" fill="none" /><path d="M22 11c1.2 0 2.2-1 2.2-2.2S23.2 6.6 22 6.6" stroke="#fff" strokeWidth="1.2" fill="none" /><circle cx="22" cy="11" r="1.5" fill="#fff" /></svg>
          </a>
        </Box>
      </Box>
    </Box>
  );
};

export default AssetDetail;