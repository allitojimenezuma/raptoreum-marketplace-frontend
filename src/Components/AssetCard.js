import { Box, Image, Text, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const AssetCard = ({ asset }) => {
  // Compatibilidad para assets que vienen con diferentes nombres de campos
  const nombre = asset.nombre || asset.name || 'Sin nombre';
  const precio = asset.precio || asset.price || null;
  const referenceHash = asset.referenceHash || asset.hash || null;
  const assetImage = referenceHash
    ? "https://ipfsweb.raptoreum.com/ipfs/" + referenceHash
    : asset.image || '';

  return (
    <LinkBox
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      _hover={{ boxShadow: 'lg' }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" height="200px" width="100%" bg="gray.50" >
        {assetImage && (
          <Image src={assetImage} alt={nombre} maxH="100%" maxW="100%" objectFit="contain" />
        )}
      </Box>
      <Box p="4" textAlign="center">
        <LinkOverlay as={Link} to={`/asset/${asset.id}`}>
          <Text fontWeight="bold" fontSize="lg">{nombre}</Text>
        </LinkOverlay>
        {/* Mostrar el precio debajo del nombre */}
        {precio && (
          <Text color="teal.600" fontWeight="semibold" fontSize="md" mt={1}>
            Precio: {precio} RTM
          </Text>
        )}
      </Box>
    </LinkBox>
  )
};

export default AssetCard;
