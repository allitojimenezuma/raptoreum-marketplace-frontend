import React, { useEffect, useState, useRef } from 'react';
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
  DrawerCloseTrigger,
  useDisclosure
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import RaptoreumLogo from '../data/Raptoreum-rtm-logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(null); // Nuevo estado para el balance
  const closeBtnRef = useRef(null); // Referencia al botón de cierre
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    // Solo redirigir a login si NO estamos en /signup
    if (!token && window.location.pathname !== '/signup') {
      navigate('/login');
    }
    // Si hay token, obtener el balance
    if (token) {
      fetch('http://localhost:3000/user/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.balanceRTM !== undefined) {
            setBalance(data.balanceRTM);
          }
        })
        .catch(() => setBalance(null));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Función para cerrar el Drawer desde cualquier botón
  const closeDrawer = () => {
    if (closeBtnRef.current) {
      closeBtnRef.current.click();
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeDrawer();
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

          {/* Balance en la parte superior derecha */}
          {isLoggedIn && (
            <Box mr={6} fontWeight="bold" color="white" fontSize="xl" minW="180px" textAlign="right">
              Balance: {balance !== null ? `${balance} RTM` : '...'}
            </Box>
          )}

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
                  onClick={onOpen}
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
                        <CloseButton ref={closeBtnRef} />
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
                          onClick={closeDrawer}
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
                          onClick={() => { handleLogout(); closeDrawer(); }}
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
