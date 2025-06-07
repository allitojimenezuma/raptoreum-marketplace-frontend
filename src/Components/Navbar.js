import React, { useEffect } from 'react';
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

const Navbar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
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
    <Box bg="#003459" px={4} py={5} color="white">
      <Flex align="center" justify="space-between">
        <Link to="/">
          <Heading size="3xl">Raptoreum Asset Marketplace</Heading>
        </Link>

        <DrawerRoot>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              color="white" 
              bgColor="#003459" 
              className="menu-blue"
              borderRadius="10px"
              border="2px solid white"
              _hover={{ bg: '#1976D2', color: 'white', borderColor: '#fff' }}
            >
              Menú
            </Button>
          </DrawerTrigger>
          <Portal>
            <DrawerBackdrop />
            <DrawerPositioner>
              <DrawerContent>
                <Flex align="center" justify="space-between" p={4}>
                  <Heading size="md">Menú</Heading>
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
                      bg="#949494"
                      color="#003459"
                      borderRadius="10px"
                      _hover={{ bg: '#6d6d6d', color: 'white' }}
                    >
                      Botón 1
                    </Button>
                    <Button
                      variant="ghost"
                      w="80%"
                      alignSelf="center"
                      onClick={() => handleNavigate('/createAsset')}
                      bg="#949494"
                      color="#003459"
                      borderRadius="10px"
                      _hover={{ bg: '#6d6d6d', color: 'white' }}
                    >
                      Crear Asset
                    </Button>
                    <Button
                      variant="ghost"
                      w="80%"
                      alignSelf="center"
                      onClick={() => handleNavigate('/account')}
                      bg="#949494"
                      color="#003459"
                      borderRadius="10px"
                      _hover={{ bg: '#6d6d6d', color: 'white' }}
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
                      _hover={{ bg: '#001e36', color: 'white' }}
                    >
                      Cerrar sesión
                    </Button>
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </DrawerPositioner>
          </Portal>
        </DrawerRoot>
      </Flex>
    </Box>
  );
};

export default Navbar;
