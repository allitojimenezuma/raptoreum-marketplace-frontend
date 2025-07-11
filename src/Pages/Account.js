import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, List, Button, Flex, Spacer, createToaster } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';
import { InfoModal } from '../Components/PasswordModals';
import { useNavigate } from 'react-router-dom';
import { toaster } from '../Components/ui/toaster'
import "../Account.mobile.css";

const getUserData = async (token) => {
    try {
        const decoded = jwtDecode(token);
        const body = JSON.stringify({ email: decoded.email });
        const response = await fetch('https://rtm.api.test.unknowngravity.com/user/info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });

        if (!response.ok) throw new Error('No se pudo obtener el usuario');
        return await response.json();
    } catch (error) {
        console.error("Error en getUserData:", error);
        return null;
    }
};

function Account() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showInfoModal, setShowInfoModal] = React.useState(false);
    const [infoMessage, setInfoMessage] = React.useState('');
    const navigate = useNavigate();
    const [updatingAssetId, setUpdatingAssetId] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getUserData(token).then((data) => {
                setUserData(data);
                setLoading(false);
            });
        } else {
            setLoading(false); // No token, stop loading
        }
    }, []);

    const handleChangePassword = async () => {
        try {
            const userEmail = userData?.user?.email;
            if (!userEmail) {
                setInfoMessage("No se pudo obtener el email del usuario para el cambio de contraseña.");
                setShowInfoModal(true);
                return;
            }

            const response = await fetch('https://rtm.api.test.unknowngravity.com/user/request-password-change', { // URL CORREGIDA
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Si el endpoint está protegido y requiere autenticación (ej. JWT token):
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                },
                body: JSON.stringify({ email: userEmail }),
            });

            if (!response.ok) {
                // Intenta obtener un mensaje de error del cuerpo de la respuesta si está disponible
                const errorData = await response.json().catch(() => ({ message: 'Error al solicitar el cambio de contraseña.' }));
                throw new Error(errorData.message || 'Error al solicitar el cambio de contraseña');
            }

            // const data = await response.json(); // Descomenta si esperas datos específicos en la respuesta exitosa
            setInfoMessage("Se ha enviado un enlace de cambio de contraseña a tu correo electrónico.");
            setShowInfoModal(true);

        } catch (error) {
            console.error("Error en handleChangePassword:", error);
            setInfoMessage(error.message || "Error al procesar la solicitud. Inténtalo de nuevo más tarde.");
            setShowInfoModal(true);
        }
    };

    const handleToggleListing = async (assetDbId, currentIsListed) => {
        setUpdatingAssetId(assetDbId);
        const token = localStorage.getItem('token');
        if (!token) {
            toaster.create({
                title: "Por favor, inicia sesión.",
                type: "error",
                duration: 8000
            });
            setUpdatingAssetId(null);
            return;
        }

        try {
            const response = await fetch(`https://rtm.api.test.unknowngravity.com/assets/${assetDbId}/toggle-listing`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isListed: !currentIsListed }),
            });

            const responseData = await response.json();

            if (response.ok) {
                toaster.create({
                    title: "Estado de listado actualizado.",
                    type: "success",
                    duration: 8000
                });
                setUserData(prevUserData => {
                    if (!prevUserData || !prevUserData.wallets) return prevUserData;
                    const updatedWallets = prevUserData.wallets.map(wallet => ({
                        ...wallet,
                        assets: wallet.assets.map(asset => {
                            if (asset.id === assetDbId) {
                                return { ...asset, isListed: !currentIsListed };
                            }
                            return asset;
                        }),
                    }));
                    return { ...prevUserData, wallets: updatedWallets };
                });
            } else {
                throw new Error(responseData.message || 'Error al actualizar el estado de listado.');
            }
        } catch (error) {
            console.error("Error en handleToggleListing:", error);
            toaster.create({
                title: "Error al actualizar el estado de listado.",
                type: "error",
                duration: 8000
            });
        } finally {
            setUpdatingAssetId(null);
        }
    };

    const handleImportAssets = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toaster.create({
                title: "Por favor, inicia sesión.",
                type: "error",
                duration: 5000
            });
            setUpdatingAssetId(null);
            return;
        }

        try {
            const response = await fetch(`https://rtm.api.test.unknowngravity.com/assets/missingAssets`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            const responseData = await response.json();

            if (response.ok) {
                //confirmar que quiere importar los assets
                if (responseData.missingAssets && responseData.missingAssets.length > 0) {
                    const missingAssets = responseData.missingAssets.map(asset => `${asset.name}`).join(', ');
                    const confirmImport = window.confirm(`Se encontraron los siguientes assets que no están registrados en la plataforma: ${missingAssets}. ¿Deseas importarlos?`);
                    if (confirmImport) {
                        // Paso 2: Si el usuario confirma, hacemos la llamada a la API para importar los assets
                        const importApiCall = fetch(`https://rtm.api.test.unknowngravity.com/assets/importMissingAssets`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            }
                        }).then(async (res) => {
                            const data = await res.json();
                            if (!res.ok) {
                                throw new Error(data.message || 'Error al importar los assets.');
                            }
                            return data;
                        });

                        toaster.promise(importApiCall, {
                            loading: 'Importando assets, por favor espera...',
                            success: (data) => {
                                // Refrescamos los datos del usuario para reflejar los cambios
                                getUserData(token).then((newUserData) => {
                                    setUserData(newUserData);
                                });
                                return data.message || 'Proceso de importación finalizado.';
                            },
                            error: (err) => err.message || 'Ocurrió un error durante la importación.'
                        });

                        importApiCall.finally(() => setIsImporting(false));
                    } else {
                        // El usuario canceló la importación
                        toaster.create({
                            title: "Importación cancelada.",
                            type: "info",
                            duration: 3000
                        });
                        setIsImporting(false);
                    }
                } else {
                    // No se encontraron assets faltantes
                    toaster.create({
                        title: "No se encontraron assets para importar.",
                        type: "info",
                        duration: 3000
                    });
                    setIsImporting(false);
                }
            } else {
                throw new Error(responseData.message || 'Error al actualizar el estado de listado.');
            }
        } catch (error) {
            console.error("Error en handleToggleListing:", error);
            // Llamada a toast actualizada
            toaster.create({
                title: "Error al actualizar el estado de listado.",
                type: "error",
                duration: 5000
            });
            setIsImporting(false);
        }

    };



    if (loading) {
        return <Text>Cargando...</Text>;
    }

    if (!userData || !userData.user) {
        return <Text>No se pudo cargar la información del usuario. Por favor, inicia sesión.</Text>;
    }

    const { user, wallets } = userData;


    return (
        <Box maxW="800px" mx="auto" mt={10} p={6} bg="white" borderRadius="10px" boxShadow="0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459" color="#003459" style={{ border: '3px solid #003459' }}>
            <Heading mb={4} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Mi Cuenta</Heading>
            <VStack align="start" spacing={2} mb={10}>
                <Text><b>Nombre:</b> {user.name}</Text>
                <Text><b>Email:</b> {user.email}</Text>
                <Text><b>ID:</b> {user.id}</Text>
                <Flex width="100%" alignItems="center" justifyContent="space-between" direction={{ base: "column", md: "row" }}>
                    <Button
                        bg="#003459"
                        color="white"
                        borderRadius="10px"
                        _hover={{ bg: '#005080', color: 'white' }}
                        onClick={handleChangePassword}
                        type="button"
                        mb={{ base: 2, md: 0 }}
                    >
                        Cambiar contraseña
                    </Button>

                    <Button
                        bg="#003459"
                        color="white"
                        borderRadius="10px"
                        _hover={{ bg: '#005080', color: 'white' }}
                        onClick={ () => navigate('/history') }
                        type="button"
                        ml={{ base: 0, md: 4 }}
                        width={{ base: '100%', md: 'auto' }}
                    >
                        Ver historial de la cuenta
                    </Button>
                </Flex>

            </VStack>
            <Flex display="flex" alignItems="center" mb={4} justifyContent="space-between">
                <Heading color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Mis Wallets y Assets</Heading>
                <Button
                    bg="#003459"
                    color="white"
                    borderRadius="10px"
                    _hover={{ bg: '#005080', color: 'white' }}
                    onClick={handleImportAssets}
                    type="button"
                >
                    Importar Assets Externos
                </Button>
            </Flex>

            {wallets && wallets.length > 0 ? (
                <List.Root spacing={4} mb={4}>
                    {wallets.map((wallet) => (
                        <List.Item key={wallet.id} p={0} borderWidth={1} borderRadius="md" bg="#e2e8f0" boxShadow="md" borderColor="#003459">
                            <Box p={3} display="flex" alignItems="center" justifyContent="space-between">
                                <Text fontWeight="bold" mb={1} color="#003459">
                                    Dirección: {wallet.direccion}
                                </Text>

                                {!wallet.assets || wallet.assets.length === 0 ? (
                                    <Text color="gray.500" fontSize="sm">No hay assets en esta wallet.</Text>
                                ) : null}

                            </Box>
                            {wallet.assets && wallet.assets.length > 0 ? (
                                <List.Root spacing={1} mt={2} pl={3} pr={3} pb={3}>
                                    {wallet.assets.map((asset) => {
                                        const referenceHash = asset.referenceHash || asset.hash || null;
                                        const assetImage = referenceHash
                                            ? "https://ipfsweb.raptoreum.com/ipfs/" + referenceHash
                                            : null;
                                        return (
                                            <List.Item
                                                key={asset.id}
                                                className="asset-list-item"
                                                display="flex"
                                                alignItems="center"
                                                bg="white"
                                                borderRadius="md"
                                                boxShadow="sm"
                                                p={2}
                                                mb={1}
                                            >
                                                {assetImage && (
                                                    <img
                                                        src={assetImage}
                                                        alt={asset.name || asset.nombre}
                                                        className="asset-img-responsive"
                                                        style={{ width: 80, height: 'auto', marginRight: 16, borderRadius: 8, objectFit: 'contain' }}
                                                    />
                                                )}
                                                <Box
                                                    flexGrow={1}
                                                    onClick={() => navigate(`/asset/${asset.id}`)}
                                                    cursor="pointer"
                                                    _hover={{ bg: "gray.50" }}
                                                >
                                                    <Text fontWeight="bold" color="#003459">Nombre: {asset.name || asset.nombre}</Text>
                                                    <Text fontSize="xs" color="gray.500">Asset ID (Ticker): {asset.asset_id}</Text>
                                                    <Text fontSize="xs" color="gray.500">DB ID: {asset.id}</Text>
                                                    <Text fontSize="xs" color={asset.isListed ? "green.500" : "red.500"} fontWeight="bold">
                                                        Estado: {asset.isListed ? "Listado" : "No Listado"}
                                                    </Text>
                                                    {asset.price !== undefined && (
                                                        <Text fontSize="sm" color="#007ea7" fontWeight="bold">Precio: {asset.price} RTM</Text>
                                                    )}
                                                </Box>
                                                <Button
                                                    className="asset-action-btn"
                                                    mt={{ base: 2, md: 0 }}
                                                    size="sm"
                                                    bg="#003459"
                                                    color="white"
                                                    borderRadius="10px"
                                                    _hover={{ bg: '#005080', color: 'white' }}
                                                    onClick={() => handleToggleListing(asset.id, asset.isListed)}
                                                    isLoading={updatingAssetId === asset.id}
                                                    isDisabled={updatingAssetId === asset.id}
                                                    width={{ base: '50%', md: 'auto' }}
                                                    alignSelf={{ base: 'center', md: 'center' }}
                                                    ml={{ base: 0, md: 4 }}
                                                    display="flex"
                                                >
                                                    {asset.isListed ? "Deslistar" : "Listar"}
                                                </Button>
                                            </List.Item>
                                        );
                                    })}
                                </List.Root>
                            ) : null}
                        </List.Item>
                    ))}
                </List.Root>
            ) : (
                <Text color="gray.500" mb={4}>No tienes wallets asociadas o no contienen assets.</Text>
            )}
            <InfoModal
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
                title="Información"
                message={infoMessage}
            />
        </Box>
    );
}

export default Account;