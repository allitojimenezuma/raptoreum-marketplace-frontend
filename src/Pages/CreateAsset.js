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

        
        try {
            const token = localStorage.getItem('token');
            const assetData = {
                token,
                nombre,
                descripcion,
                precio,
                foto: preview, // Send the Base64 Data URL string
            };

            const response = await fetch('http://localhost:3000/assets/createAsset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        <Box maxW="500px" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
            <Heading mb={6}>Crear Nuevo Asset</Heading>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <VStack spacing={4} align="stretch">
                    <FieldRoot>
                        <FieldLabel>Nombre</FieldLabel>
                        <Input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre del asset"
                        />
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
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFotoChange}
                            disabled={!!foto}
                        />
                        {preview && (
                            <Box mt={2} position="relative" display="flex">
                                <Image src={preview} alt="Preview" maxH="150px" borderRadius="md" />
                                <Button
                                    bg="#003459"
                                    color="white"
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
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText="Creando..."
                    >
                        Crear Asset
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};

export default CreateAsset;