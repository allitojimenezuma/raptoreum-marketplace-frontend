import { useEffect, useState } from 'react';
import { SimpleGrid, Heading, Box } from '@chakra-ui/react';
import AssetCard from '../Components/AssetCard';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const getAssets = async () => {
  try {
    const response = await fetch('https://rtm.api.test.unknowngravity.com/assets');
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
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // Fetch información del usuario para obtener el ID, similar a Account.
          const response = await fetch('https://rtm.api.test.unknowngravity.com/user/info', {
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
            console.error('Error al obtener información del usuario para la página de inicio');
          }
        } catch (error) {
          console.error('Error al obtener el ID del usuario conectado para la página de inicio:', error);
        }
      }
    };

    fetchLoggedInUser();
    getAssets().then(setAssets);
  }, []);


  return (
    <>
      <Heading mb={6} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Assets en Raptoreum</Heading>
      <SimpleGrid minChildWidth="250px" spacing={10} width="100%">
        {assets.map((asset) => (
          <Box key={asset.id} p="0" m="0">
            <AssetCard asset={asset} loggedInUserId={loggedInUserId} />
          </Box>
        ))}
      </SimpleGrid>
    </>
  );
};

export default Home;