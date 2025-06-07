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
    <Box className="asset-card" style={{ border: '3px solid #003459', borderRadius: '24px', background: '#fff', boxShadow: '0 6px 32px 0 rgba(0,52,89,0.13), 0 2px 8px 0 #007ea7', transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1), transform 0.2s', padding: 0, margin: '32px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', overflow: 'hidden' }}>
      {assetImage && (
        <Box display="flex" alignItems="center" justifyContent="center" height="220px" width="100%" bg="#f7fafc" style={{ borderTopLeftRadius: '21px', borderTopRightRadius: '21px', overflow: 'hidden', margin: 0, padding: 0, position: 'relative' }}>
          <img
            src={assetImage}
            alt={nombre}
            style={{ width: 'auto', height: '200px', maxWidth: '90%', borderRadius: '16px', boxShadow: '0 2px 8px 0 rgba(0,52,89,0.10)', background: '#f7fafc', display: 'block', objectFit: 'contain', margin: '0 auto' }}
          />
        </Box>
      )}
      <Box p={6} width="100%" textAlign="center" bg="#f7fafc" style={{ borderBottomLeftRadius: '21px', borderBottomRightRadius: '21px' }}>
        <Heading>{nombre}</Heading>
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
        <Button
          bg="#003459"
          color="#fff"
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
    </Box>
  );
};

export default AssetDetail;