import { useState } from 'react';
import { Box, Heading, Button } from '@chakra-ui/react';
import AuthForm from '../Components/AuthForm';
import { useNavigate } from 'react-router-dom';



const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password }) => {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    console.log("Data", JSON.stringify({ email, password }));

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      console.log('Sesión iniciada:', data);
      navigate('/');

    } else {
      console.error('Error al crear el usuario', response.body.message, response.body.error);
    }

  }


  return (<Box maxW="400px" mx="auto" mt={8}>
    <AuthForm onAuth={handleSubmit} />
    <Button
      mt={4}
      variant="link"
      bg="#003459"
      color="white"
      onClick={() => {
        localStorage.removeItem('token');
        navigate('/signup');
      }}
      width="full"
    >
      ¿No tienes cuenta? Crear cuenta
    </Button>
  </Box>);
};

export default Login;