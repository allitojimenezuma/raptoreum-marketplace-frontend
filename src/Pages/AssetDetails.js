import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Box, Heading, Image, Text, Spinner, Center, Button, Input, VStack } from '@chakra-ui/react';

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
          <Center flexDirection="column">
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
            >
              {isCheckingBalance ? <Spinner size="sm" /> : 'Comprar Asset'}
            </Button>
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





      </Box>
    </Box>
  );
};

export default AssetDetail;