import React from 'react';
import { Dialog, Button, Text, Input, VStack, Portal } from '@chakra-ui/react';

// Generic modal for info
export function InfoModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;
  return (
    <Portal>
      <Dialog.Root open={isOpen} onClose={onClose} preventScroll>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content zIndex={1400}>
            <Dialog.Header>{title}</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Text>{message}</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button bg="#003459" color="white" borderRadius="10px" _hover={{ bg: '#005080', color: 'white' }} onClick={onClose} autoFocus>
                Cerrar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  );
}

// Modal for requesting email to reset password
export function RequestEmailModal({ isOpen, onClose, onSend }) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSend = async () => {
    setLoading(true);
    await onSend(email);
    setLoading(false);
    // setEmail(''); // Optionally reset email field after send
  };

  if (!isOpen) return null; // Ensure modal doesn't render if not open

  return (
    <Portal>
      <Dialog.Root open={isOpen} onClose={onClose} preventScroll>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content zIndex={1400}>
            <Dialog.Header>Restablecer contraseña</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <VStack spacing={4}>
                <Text>Introduce tu correo electrónico para recibir el enlace de restablecimiento.</Text>
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button bg="#003459" color="white" borderRadius="10px" _hover={{ bg: '#005080', color: 'white' }} mr={3} onClick={handleSend} isLoading={loading} type="button">
                Enviar
              </Button>
              <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  );
}
