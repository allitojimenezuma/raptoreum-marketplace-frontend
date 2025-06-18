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
      fetch('https://rtm.api.test.unknowngravity.com/user/balance', {
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
      <Box bg="#003459" px={4} py={{ base: 8, md: 5 }} color="white">
        <Flex direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} justify="space-between">
          {/* Primera línea: Título y logo */}
          <Flex align="center" justify={{ base: "center", md: "flex-start" }}>
            <Link to="/">
              <Heading 
                fontSize={{ base: "lg", md: "2xl", lg: "3xl" }}
                whiteSpace="nowrap"
              >
                Raptoreum Asset Marketplace
              </Heading>
            </Link>
            <Box ml={4} display="flex" alignItems="center">
              <img
                src={RaptoreumLogo}
                alt="Raptoreum Logo"
                style={{ height: window.innerWidth < 768 ? '32px' : '48px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(2px 2px 0 #fff)' }}
              />
            </Box>
          </Flex>

          <Flex mt={{ base: 4, md: 0 }} align="center">
            {isLoggedIn && (
              <Box
                fontWeight="bold"
                color="white"
                fontSize={{ base: "md", md: "lg" }}
                minW="100px"
                textAlign={{ base: "center", md: "right" }}
                flex="1"
              >
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
                    style={{ marginLeft: '15px' }} 
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
                            onClick={() => handleNavigate('/importAsset')}
                          >
                            Importar Asset
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
                            onClick={() => handleNavigate('/offers')}
                            bg="#e0e0e0"
                            color="#003459"
                            borderRadius="10px"
                            _hover={{ bg: '#bdbdbd', color: 'white' }}
                          >
                            Ofertas Recibidas / Enviadas
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
