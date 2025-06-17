import React, { useState } from 'react';
import { Box, Heading, VStack, Input, Textarea, Button } from '@chakra-ui/react';

const ImportAsset = () => {
  const [assetName, setAssetName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/assets/importAsset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assetName,
          description,
          price
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al importar el asset');
      setSuccess('Asset importado correctamente.');
      setAssetName('');
      setDescription('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="500px" mx="auto" mt={10} p={6} bg="white" borderRadius="10px" color="#003459" style={{ border: '3px solid #003459', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459' }}>
      <Heading mb={6} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Importar Asset</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
            <label htmlFor="assetName" style={{ fontWeight: 600, color: '#003459' }}>Nombre del Asset</label>
            <Input
              id="assetName"
              value={assetName}
              onChange={e => setAssetName(e.target.value)}
              placeholder="Nombre del asset"
              required
            />
          </Box>
          <Box>
            <label htmlFor="description" style={{ fontWeight: 600, color: '#003459' }}>Descripción</label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción del asset"
              required
            />
          </Box>
          <Box>
            <label htmlFor="price" style={{ fontWeight: 600, color: '#003459' }}>Precio</label>
            <Input
              id="price"
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Precio del asset"
              required
            />
          </Box>
          {error && (
            <Box color="red.500" fontSize="sm" mt={-2}>
              {error}
            </Box>
          )}
          {success && (
            <Box color="green.500" fontSize="sm" mt={-2}>
              {success}
            </Box>
          )}
          <Button
            bg="#003459"
            color="white"
            borderRadius="10px"
            w="50%"
            alignSelf="center"
            mt={6}
            type="submit"
            isLoading={isSubmitting}
            loadingText="Importando..."
            _hover={{ bg: '#005080', color: 'white' }}
          >
            Importar Asset
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ImportAsset;
