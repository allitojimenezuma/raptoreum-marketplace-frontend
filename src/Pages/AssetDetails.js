import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Heading, Image, Text, Spinner, Center, Button } from '@chakra-ui/react';

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

  useEffect(() => {
    setLoading(true);
    getAsset(id).then((data) => {
      setAsset(data);
      setLoading(false);
    });
  }, [id]);

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
    <Box maxW="600px" mx="auto" flexDirection="column" display="flex" alignItems="center" justifyContent="center">
      {assetImage && (
        <Image src={assetImage} alt={nombre} borderRadius="md" mb={4} maxW="300px" />
      )}
      <Heading>{nombre}</Heading>
      {/* Mostrar el nombre del dueño si está disponible */}
      {asset.ownerName && (
        <Text color="gray.600" fontSize="md" mt={1}>
          Usuario: {asset.ownerName}
        </Text>
      )}
      {precio && (
        <Text color="teal.600" fontWeight="semibold" fontSize="xl" mt={2}>
          Precio: {precio} RTM
        </Text>
      )}
      {descripcion && (
        <Text mt={2} fontSize="md" color="gray.700">{descripcion}</Text>
      )}
      {/* Botón para comprar el asset */}
      <Button
        colorScheme="teal"
        mt={4}
        onClick={async () => {
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
              // Aquí podrías recargar el asset o redirigir
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
        }}
      >
        Comprar Asset
      </Button>
    </Box>
  );
};

export default AssetDetail;