import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  CloseButton,
  Portal,
  DrawerRoot,
  DrawerTrigger,
  DrawerBackdrop,
  DrawerPositioner,
  DrawerContent,
  DrawerBody,
  DrawerCloseTrigger
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import RaptoreumLogo from '../data/Raptoreum-rtm-logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    // Solo redirigir a login si NO estamos en /signup
    if (!token && window.location.pathname !== '/signup') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleNavigate = (path) => {
    navigate(path);
  }

  return (
    <>
      <Box bg="#003459" px={4} py={5} color="white">
        <Flex align="center" justify="space-between">
          <Flex align="center">
            <Link to="/">
              <Heading size="3xl">Raptoreum Asset Marketplace</Heading>
            </Link>
            <Box ml={4} display="flex" alignItems="center">
              <img
                src={RaptoreumLogo}
                alt="Raptoreum Logo"
                style={{ height: '60px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(2px 2px 0 #fff)' }}
              />
            </Box>
          </Flex>

          {isLoggedIn && (
            <DrawerRoot>
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  color="white" 
                  bgColor="#003459" 
                  className="menu-blue"
                  borderRadius="10px"
                  border="2px solid white"
                  _hover={{ bg: '#005080', color: 'white', borderColor: '#fff' }}
                  style={{ marginRight: '15px' }} 
                >
                  Menú
                </Button>
              </DrawerTrigger>
              <Portal>
                <DrawerBackdrop />
                <DrawerPositioner>
                  <DrawerContent>
                    <Flex align="center" justify="space-between" p={4}>
                      <Heading size="md" color="#003459">Menú</Heading>
                      <DrawerCloseTrigger asChild>
                        <CloseButton />
                      </DrawerCloseTrigger>
                    </Flex>
                    <DrawerBody>
                      <VStack align="start" spacing={4} mt={2}>
                        <Button
                          variant="ghost"
                          w="80%"
                          alignSelf="center"
                          bg="#e0e0e0"
                          color="#003459"
                          borderRadius="10px"
                          _hover={{ bg: '#bdbdbd', color: 'white' }}
                        >
                          Botón 1
                        </Button>
                        <Button
                          variant="ghost"
                          w="80%"
                          alignSelf="center"
                          onClick={() => handleNavigate('/createAsset')}
                          bg="#e0e0e0"
                          color="#003459"
                          borderRadius="10px"
                          _hover={{ bg: '#bdbdbd', color: 'white' }}
                        >
                          Crear Asset
                        </Button>
                        <Button
                          variant="ghost"
                          w="80%"
                          alignSelf="center"
                          onClick={() => handleNavigate('/account')}
                          bg="#e0e0e0"
                          color="#003459"
                          borderRadius="10px"
                          _hover={{ bg: '#bdbdbd', color: 'white' }}
                        >
                          Mi cuenta
                        </Button>
                        <Button
                          colorScheme="red"
                          w="80%"
                          alignSelf="center"
                          onClick={handleLogout}
                          bg="#003459"
                          color="white"
                          borderRadius="10px"
                          _hover={{ bg: '#005080', color: 'white' }}
                        >
                          Cerrar sesión
                        </Button>
                      </VStack>
                    </DrawerBody>
                  </DrawerContent>
                </DrawerPositioner>
              </Portal>
            </DrawerRoot>
          )}
        </Flex>
      </Box>
      <Box
        height="15px"
        width="100%"
        bgGradient="linear-gradient( #949494 10%, #e0e0e0 100%)"
        boxShadow="0 6px 16px 0 rgba(0,0,0,0.18)"
      />
    </>
  );
};

export default Navbar;
