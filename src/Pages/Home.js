import { useEffect, useState } from 'react';
import { SimpleGrid, Heading, Box } from '@chakra-ui/react';
import AssetCard from '../Components/AssetCard';

const getAssets = async () => {
  try {
    const response = await fetch('http://localhost:3000/assets');
    if (!response.ok) {
      throw new Error('Error al obtener los activos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
};

const Home = () => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    getAssets().then(setAssets);
  }, []);

  return (
    <>
      <Heading mb={4}>Assets en Raptoreum</Heading>
      <SimpleGrid columns={[1, 2, 3, 4]} spacing={10} maxWidth="1200px" >
        {assets.map((asset) => (
          <Box key={asset.id} p="0" m="0">
            <AssetCard asset={asset} />
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
};

export default Home;