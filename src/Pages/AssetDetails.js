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

  const assetImage = "https://ipfsweb.raptoreum.com/ipfs/" + asset.referenceHash;

  return (
    <Box maxW="600px" mx="auto" bg="red.50" flexDirection="column" display="flex" alignItems="center" justifyContent="center">
      <Image src={assetImage} alt={asset.nombre} borderRadius="md" mb={4} maxW="400px" />
      <Heading>{asset.nombre}</Heading>
      {/* <Text mt={2}>{asset.description}</Text> */}
    </Box>
  );
};

export default AssetDetail;