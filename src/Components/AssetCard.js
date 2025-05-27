import { Box, Image, Text, LinkBox, LinkOverlay } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const AssetCard = ({ asset }) => {

  const assetImage = "https://ipfsweb.raptoreum.com/ipfs/" + asset.referenceHash;

  return (
    <LinkBox
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      _hover={{ boxShadow: 'lg' }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" height="200px" width="100%" bg="gray.50" >
        <Image src={assetImage} alt={asset.nombre} maxH="100%" maxW="100%" objectFit="contain" />
      </Box>
      <Box p="4">
        <LinkOverlay as={Link} to={`/asset/${asset.id}`}>
          <Text fontWeight="bold" fontSize="lg">{asset.nombre}</Text>
        </LinkOverlay>
        {/* <Text color="gray.600">{asset.description.slice(0, 60)}...</Text> */}
      </Box>
    </LinkBox>
  )
};

export default AssetCard;
