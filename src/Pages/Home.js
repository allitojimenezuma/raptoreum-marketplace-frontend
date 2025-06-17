import { useEffect, useState } from 'react';
import { SimpleGrid, Heading, Box } from '@chakra-ui/react';
import AssetCard from '../Components/AssetCard';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

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
  const [loggedInUserId, setLoggedInUserId] = useState(null); // State for logged-in user's ID

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // Fetch user info to get the ID, similar to Account.
          const response = await fetch('http://localhost:3000/user/info', {
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
            console.error('Failed to fetch user info for Home page');
          }
        } catch (error) {
          console.error('Error fetching logged-in user ID for Home page:', error);
        }
      }
    };

    fetchLoggedInUser();
    getAssets().then(setAssets);
  }, []);


  return (
    <>
      <Heading mb={4} color="#003459" size="2xl">Assets en Raptoreum</Heading>
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