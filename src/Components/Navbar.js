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
    <Box bg="#003459" px={4} py={2} color="white">
      <Flex align="center" justify="space-between">
        <Link to="/">
          <Heading size="md">Raptoreum Asset Marketplace</Heading>
        </Link>

        <DrawerRoot>
          <DrawerTrigger asChild>
            <Button variant="ghost" color="white" bgColor="#003459" className="menu-blue">
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
                    <Button variant="ghost" w="100%" bg="#003459" color="white">Botón 1</Button>
                    <Button variant="ghost" w="100%" onClick={() => handleNavigate('/createAsset')} bg="#003459" color="white">Crear Asset</Button>
                    <Button variant="ghost" w="100%" onClick={() => handleNavigate('/account')} bg="#003459" color="white">Mi cuenta</Button>
                    <Button colorScheme="red" w="100%" onClick={handleLogout} bg="#003459" color="white">
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
