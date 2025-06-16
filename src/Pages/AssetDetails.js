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
    try {
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
    } catch (err) {
      console.log('Error de red o servidor al intentar comprar el asset:', err);
      alert('Error de red o servidor al intentar comprar el asset.');
    }
  }




  useEffect(() => {
    fetchLoggedInUser();
    setLoading(true);

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

  return (
    <Box className="asset-card" style={{ border: '3px solid #003459', borderRadius: '24px', background: '#fff', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459', transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1), transform 0.2s', padding: 0, margin: '32px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', overflow: 'hidden' }}>
      {assetImage && (
        <Box display="flex" alignItems="center" justifyContent="center" height="320px" width="100%" bg="#f7fafc" style={{ borderTopLeftRadius: '21px', borderTopRightRadius: '21px', overflow: 'visible', margin: 0, padding: 0, position: 'relative' }}>
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
      <Box p={6} width="100%" textAlign="center" bg="#f7fafc" style={{ borderBottomLeftRadius: '21px', borderBottomRightRadius: '21px' }}>
        <Heading color="#003459">{nombre}</Heading>
        {/* Mostrar el nombre del dueño si está disponible */}
        {asset.ownerName && (
          <Text color="gray.600" fontSize="md" mt={1}>
            Usuario: {asset.ownerName}
          </Text>
        )}
        {precio && (
          <Text style={{ color: '#007ea7', fontWeight: 'bold' }} fontSize="xl" mt={2}>
            Precio: {precio} RTM
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
          <Center>
            <Button
              bg="#003459"
              color="#fff"
              borderRadius="10px"
              width="50%"
              mt={4}
              onClick={buyAsset}
              isDisabled={!asset}
              _hover={{ bg: '#005080' }}
            >
              Comprar Asset
            </Button>
          </Center>
        )}





      </Box>
    </Box>
  );
};

export default AssetDetail;