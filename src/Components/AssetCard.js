import { Box, Text, LinkBox, LinkOverlay, Image } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const AssetCard = ({ asset }) => {
  // Compatibilidad para assets que vienen con diferentes nombres de campos
  const nombre = asset.nombre || asset.name || 'Sin nombre';
  const precio = asset.precio || asset.price || null;
  const referenceHash = asset.referenceHash || asset.hash || null;
  const assetImage = referenceHash
    ? "https://ipfsweb.raptoreum.com/ipfs/" + referenceHash
    : asset.image || '';

  const [zoomed, setZoomed] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Evita que el click en un link dentro de la tarjeta dispare doble navegación
    if (e.target.tagName === 'A') return;
    navigate(`/asset/${asset.id}`);
  };

  return (
    <LinkBox
      className="asset-card"
      role="group"
      style={{ border: '3px solid #003459', borderRadius: '24px', background: '#fff', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459', transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1), transform 0.2s', padding: 0, margin: '10px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflow: 'hidden', cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      <Box display="flex" alignItems="center" justifyContent="center" height="140px" width="100%" bg="#f7fafc" style={{ borderTopLeftRadius: '21px', borderTopRightRadius: '21px', overflow: 'visible', margin: 0, padding: 0, position: 'relative' }}>
        {assetImage && (
          <Box
            as="span"
            className="asset-image-wrapper"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', margin: '0 auto', position: 'relative', overflow: 'visible' }}
          >
            <Image
              src={assetImage}
              alt={nombre}
              className="asset-image"
              width="100%"
              height="100%"
              borderRadius="16px"
              transition="transform 0.35s cubic-bezier(.25,.8,.25,1)"
              boxShadow="0 2px 8px 0 rgba(0,52,89,0.10)"
              background="#f7fafc"
              display="block"
              objectFit="contain"
              style={{
                objectFit: 'contain',
                transformOrigin: 'center top',
                transform: zoomed ? 'scale(1.7) translateY(1px)' : 'none',
                zIndex: zoomed ? 10 : 1,
                boxShadow: zoomed ? '0 16px 48px 0 rgba(0,52,89,0.30), 0 6px 24px 0 #003459' : '0 2px 8px 0 rgba(0,52,89,0.10)'
              }}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            />
          </Box>
        )}
      </Box>
      <Box p="4" textAlign="center" bg="#f7fafc" style={{ borderBottomLeftRadius: '21px', borderBottomRightRadius: '21px' }}>
        <LinkOverlay as={Link} to={`/asset/${asset.id}`} onClick={e => e.stopPropagation()}>
          <Text fontWeight="bold" fontSize="lg" color="#003459">{nombre}</Text>
        </LinkOverlay>
        {/* Mostrar el nombre del usuario si está disponible */}
        {asset.ownerName && (
          <Text color="gray.600" fontSize="sm" mt={1}>
            Usuario: {asset.ownerName}
          </Text>
        )}
        {/* Mostrar el precio debajo del nombre */}
        {precio && (
          <Text style={{ color: '#007ea7', fontWeight: 'bold' }} fontSize="md" mt={1}>
            Precio: {precio} RTM
          </Text>
        )}
      </Box>
    </LinkBox>
  )
};

export default AssetCard;
