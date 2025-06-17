import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  FieldRoot,      // Changed from Field
  FieldLabel,
  FieldErrorText,
  Text,
} from '@chakra-ui/react';
import { InfoModal } from '../Components/PasswordModals';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // General errors
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState('');
  const [infoModalTitle, setInfoModalTitle] = useState('Información');

  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    let isValid = true;
    if (newPassword.length < 6) {
      setNewPasswordError('La contraseña debe tener al menos 6 caracteres.');
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword, // Added confirmPassword to the request body
        }),
      });

      // Read the response body as text first, as it can only be consumed once.
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          // Try to parse the text as JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If parsing as JSON fails, use the responseText directly (if it's not too long)
          // or a generic message if it looks like an HTML page.
          if (responseText.trim().startsWith('<!DOCTYPE html') || responseText.trim().startsWith('<html>')) {
            errorMessage = 'Error de comunicación con el servidor. Por favor, inténtalo más tarde.';
          } else {
            errorMessage = responseText.length > 200 ? `Error del servidor: ${response.statusText}` : responseText;
          }
        }
        throw new Error(errorMessage);
      }

      // If response.ok is true, then we parse the text as JSON
      const data = JSON.parse(responseText);

      setInfoModalTitle('Éxito');
      setInfoModalMessage(data.message || 'Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.');
      setShowInfoModal(true);

    } catch (err) {
      // Set general error for issues not specific to a field, or if backend returns general error
      setError(err.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.');
      // Also show in modal for consistency
      setInfoModalTitle('Error');
      setInfoModalMessage(err.message || 'Ocurrió un error. Por favor, inténtalo de nuevo.');
      setShowInfoModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoModalClose = () => {
    setShowInfoModal(false);
    if (infoModalTitle === 'Éxito') {
      navigate('/login');
    }
  }

  return (
    <Box maxW="450px" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white" color="#003459" style={{ border: '3px solid #003459' }}>
      <Heading mb={6} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Restablecer Contraseña</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FieldRoot> {/* Changed from Field */}
            <FieldLabel htmlFor="newPassword">Nueva Contraseña</FieldLabel>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Introduce tu nueva contraseña"
              focusBorderColor="#007ea7"
              borderColor="#003459"
              isInvalid={!!newPasswordError} // Added isInvalid to Input
              aria-describedby={newPasswordError ? "newPassword-error-text" : undefined}
            />
            {newPasswordError && <FieldErrorText id="newPassword-error-text">{newPasswordError}</FieldErrorText>}
          </FieldRoot>

          <FieldRoot> {/* Changed from Field */}
            <FieldLabel htmlFor="confirmPassword">Confirmar Nueva Contraseña</FieldLabel>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              focusBorderColor="#007ea7"
              borderColor="#003459"
              isInvalid={!!confirmPasswordError} // Added isInvalid to Input
              aria-describedby={confirmPasswordError ? "confirmPassword-error-text" : undefined}
            />
            {confirmPasswordError && <FieldErrorText id="confirmPassword-error-text">{confirmPasswordError}</FieldErrorText>}
          </FieldRoot>

          {error && (
            <Text color="red.500" fontSize="sm" mt={2}>{error}</Text>
          )}

          <Button
            type="submit"
            isLoading={loading}
            bg="#003459"
            color="white"
            _hover={{ bg: '#005080' }}
            w="60%"
            borderRadius="10px"
          >
            Restablecer Contraseña
          </Button>
        </VStack>
      </form>
      <InfoModal
        isOpen={showInfoModal}
        onClose={handleInfoModalClose}
        title={infoModalTitle}
        message={infoModalMessage}
      />
    </Box>
  );
}

export default ResetPasswordPage;
