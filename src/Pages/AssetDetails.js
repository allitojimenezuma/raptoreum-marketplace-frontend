import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Heading, Image, Text, Spinner, Center } from '@chakra-ui/react';

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
        <Image src={assetImage} alt={nombre} borderRadius="md" mb={4} maxW="400px" />
      )}
      <Heading>{nombre}</Heading>
      {precio && (
        <Text color="teal.600" fontWeight="semibold" fontSize="xl" mt={2}>
          Precio: {precio} RTM
        </Text>
      )}
      {descripcion && (
        <Text mt={2} fontSize="md" color="gray.700">{descripcion}</Text>
      )}
    </Box>
  );
};

export default AssetDetail;