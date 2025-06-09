import React, { useState } from 'react';
import {
    Box,
    Heading,
    VStack,
    FieldRoot,
    FieldLabel,
    Input,
    Textarea,
    Button,
    Image,
    For
} from '@chakra-ui/react';

const CreateAsset = () => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        setFoto(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview('');
        }
    };

    const handleRemoveFoto = () => {
        setFoto(null);
        setPreview('');
    };

    const isNombreValido = (nombre) => {
        // Solo letras mayúsculas, números y _ . /
        // Longitud 3-30, no puede empezar/terminar con símbolo
        const regex = /^(?![_.\/])[A-Z0-9_.\/]{3,30}(?<![_.\/])$/;
        return regex.test(nombre);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isSubmitting) return; // Prevent multiple submissions

        setIsSubmitting(true);

        if (!nombre || !descripcion || !precio) {
            setError('Todos los campos son obligatorios');
            setIsSubmitting(false);
            return;
        }

        if (!isNombreValido(nombre)) {
            setError('El nombre no es válido.');
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const assetData = {
                nombre,
                descripcion,
                precio,
                foto: preview, // Send the Base64 Data URL string
            };

            const response = await fetch('http://localhost:3000/assets/createAsset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(assetData),
            });

            if (!response.ok) throw new Error('Error al crear el asset');

            setNombre('');
            setDescripcion('');
            setPrecio('');
            setFoto(null);
            setPreview('');

            const data = await response.json();
            alert(data.message);

        } catch (err) {
            setError('No se pudo crear el asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box maxW="500px" mx="auto" mt={10} p={6} bg="white" borderRadius="10px" color="#003459" style={{ border: '3px solid #003459', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459' }}>
            <Heading mb={6}><b>Crear Nuevo Asset</b></Heading>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <VStack spacing={4} align="stretch">
                    <FieldRoot>
                        <FieldLabel>Nombre</FieldLabel>
                        <Input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre del asset"
                        />
                        <Box color="gray.500" fontSize="sm" mt={1}>
                            El nombre debe tener entre 3 y 30 caracteres, solo mayúsculas (A-Z), números (0-9), y los símbolos _ . y /. No puede contener espacios ni otros caracteres especiales, ni empezar o terminar con un símbolo.
                        </Box>
                    </FieldRoot>
                    <FieldRoot>
                        <FieldLabel>Descripción</FieldLabel>
                        <Textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción del asset"
                        />
                    </FieldRoot>
                    <FieldRoot>
                        <FieldLabel>Precio</FieldLabel>
                        <Input
                            type="number"
                            min="0"
                            step="any"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            placeholder="Precio del asset"
                        />
                    </FieldRoot>
                    <FieldRoot>
                        <FieldLabel>Foto</FieldLabel>
                        <Box position="relative">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFotoChange}
                                display="none"
                                id="custom-file-input"
                                disabled={!!foto}
                            />
                            <Button
                                as="label"
                                htmlFor="custom-file-input"
                                bg="#949494"
                                color="white"
                                borderRadius="10px"
                                cursor={!!foto ? 'not-allowed' : 'pointer'}
                                _hover={{ bg: '#00263a' }}
                                disabled={!!foto}
                            >
                                Seleccionar archivo
                            </Button>
                        </Box>
                        {preview && (
                            <Box mt={2} position="relative" display="flex">
                                <Image src={preview} alt="Preview" maxH="150px" borderRadius="md" />
                                <Button
                                    bg="#949494"
                                    color="white"
                                    borderRadius="10px"
                                    _hover={{ bg: '#00263a' }}
                                    onClick={handleRemoveFoto}
                                >
                                    Eliminar Foto
                                </Button>
                            </Box>
                        )}
                    </FieldRoot>
                    {error && (
                        <Box color="red.500" fontSize="sm" mt={-2}>
                            {error}
                        </Box>
                    )}
                    <Button
                        bg="#003459"
                        color="white"
                        borderRadius="10px"
                        w="50%"
                        alignSelf="center"
                        mt={6} // Separación de 15px aprox
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText="Creando..."
                        _hover={{ bg: '#005080', color: 'white' }}
                    >
                        Crear Asset
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

export default CreateAsset;