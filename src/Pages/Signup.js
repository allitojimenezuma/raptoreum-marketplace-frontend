import { Box, Heading, Button } from '@chakra-ui/react';
import AuthForm from '../Components/AuthForm';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password, name }) => {
    if (!email || !password || !name) {
      alert('Por favor, completa todos los campos');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Usuario creado:', data);
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Error al crear el usuario: ' + (errorData.message || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error de red o servidor.');
    }
  }
  

  return (<Box maxW="400px" mx="auto" mt={8}>
    <AuthForm isSignup onAuth={handleSubmit} />
    <Button
      mt={4}
      variant="link"
      colorScheme="teal"
      onClick={() => navigate('/login')}
      width="full"
    >
      ¿Ya tienes cuenta? Inicia sesión
    </Button>
  </Box>);
};

export default Signup;