import { Box, Heading, Button } from '@chakra-ui/react';
import AuthForm from '../Components/AuthForm';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password, name }) => {
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    console.log("Data", JSON.stringify({ email, password, name }));

    if (response.ok) {
      const data = await response.json();
      console.log('Usuario creado:', data);
      navigate('/login');
    } else {
      console.error('Error al crear el usuario', response.body.message,response.body.error );
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