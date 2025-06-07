import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, List} from '@chakra-ui/react';
// import { AtSignIcon, StarIcon } from '@chakra-ui/icons';
import { jwtDecode } from 'jwt-decode';

const getUserData = async (token) => {
    try {
        const decoded = jwtDecode(token);
        const body = JSON.stringify({ email: decoded.email });
        const response = await fetch('http://localhost:3000/user/info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });

        if (!response.ok) throw new Error('No se pudo obtener el usuario');
        return await response.json();
    } catch (error) {
        return null;
    }
};


const Account = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        getUserData(token).then((data) => {
            setUserData(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <Text>Cargando...</Text>;
    }

    if (!userData) {
        return <Text>No se pudo cargar la información del usuario.</Text>;
    }

    const { user, wallets } = userData;


    console.log('User:', user);
    console.log('Wallets:', wallets);

    return (
        <Box maxW="600px" mx="auto" mt={10} p={6} bg="white" borderRadius="10px" boxShadow="0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459" color="#003459" style={{ border: '3px solid #003459' }}>
            <Heading mb={4}><b>Mi Cuenta</b></Heading>
            <VStack align="start" spacing={2} mb={4}>
                <Text><b>Nombre:</b> {user.name}</Text>
                <Text><b>Email:</b> {user.email}</Text>
                <Text><b>ID:</b> {user.id}</Text>
            </VStack>
            <Box my={4} />
            <Heading size="md" mb={2} color="#003459">Mis Wallets</Heading>

            {wallets && wallets.length > 0 ? (
                <List.Root spacing={4} mb={4}>
                    {wallets.map((wallet) => (
                        <List.Item key={wallet.id} p={0} borderWidth={1} borderRadius="md" bg="#e2e8f0" boxShadow="md" borderColor="#003459">
                            <Box p={3}>
                                <Text fontWeight="bold" mb={1} color="#003459">
                                    Dirección: {wallet.direccion}
                                </Text>
                                <Text fontSize="sm" color="gray.500" mb={2}>Creada: {wallet.createdAt} </Text>
                                {!wallet.assets || wallet.assets.length === 0 ? (
                                    <Text color="gray.500" fontSize="sm">No hay assets en esta wallet.</Text>
                                ) : null}
                            </Box>
                            {wallet.assets && wallet.assets.length > 0 ? (
                                <List.Root spacing={1} mt={2}>
                                    {wallet.assets.map((asset) => (
                                        <List.Item key={asset.id} display="flex" alignItems="center" bg="white" borderRadius="md" boxShadow="sm" p={2} mb={1}>
                                            <Box>
                                                <Text fontWeight="semibold" color="#003459">{asset.name || asset.nombre}</Text>
                                                <Text fontSize="xs" color="gray.500">Asset ID: {asset.asset_id}</Text>
                                                <Text fontSize="xs" color="gray.500">Hash: {asset.referenceHash}</Text>
                                                {asset.price !== undefined && (
                                                    <Text fontSize="sm" color="#007ea7" fontWeight="bold">Precio: {asset.price} RTM</Text>
                                                )}
                                            </Box>
                                        </List.Item>
                                    ))}
                                </List.Root>
                            ) : null}
                        </List.Item>
                    ))}
                </List.Root>
            ) : (
                <Text color="gray.500" mb={4}>No tienes wallets asociadas.</Text>
            )}
        </Box>
    );
};

export default Account;