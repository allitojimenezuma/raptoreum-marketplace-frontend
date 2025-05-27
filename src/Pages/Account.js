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
        <Box maxW="600px" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
            <Heading mb={4}>Mi Cuenta</Heading>
            <VStack align="start" spacing={2} mb={4}>
                <Text><b>Email:</b> {user.email}</Text>
                <Text><b>ID:</b> {user.id}</Text>
            </VStack>
            <Box my={4} />
            <Heading size="md" mb={2}>Mis Wallets</Heading>

            {wallets && wallets.length > 0 ? (
                <List.Root spacing={4} mb={4}>
                    {wallets.map((wallet) => (
                        <List.Item key={wallet.id} p={3} borderWidth={1} borderRadius="md">
                            <Text fontWeight="bold" mb={1}>
                                Dirección: {wallet.direccion}
                            </Text>
                            <Text fontSize="sm" color="gray.500" mb={2}>Creada: {new Date(wallet.createdAt).toLocaleString()}</Text>
                            
                            {wallet.assets && wallet.assets.length > 0 ? (
                                <List.Root spacing={1} mt={2}>
                                    {wallet.assets.map((asset) => (
                                        <List.Item key={asset.id} display="flex" alignItems="center">
                                            <Box>
                                                <Text fontWeight="semibold">{asset.nombre}</Text>
                                                <Text fontSize="xs" color="gray.500">Asset ID: {asset.asset_id}</Text>
                                                <Text fontSize="xs" color="gray.500">Hash: {asset.referenceHash}</Text>
                                            </Box>
                                        </List.Item>
                                    ))}
                                    
                                </List.Root>
                            ) : (
                                <Text color="gray.500" fontSize="sm">No hay assets en esta wallet.</Text>
                            )}
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