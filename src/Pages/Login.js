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


  return (
    <Box maxW="400px" mx="auto" mt={8} p={6} bg="white" borderRadius="10px" color="#003459" style={{ border: '3px solid #003459', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459' }}>
      <AuthForm onAuth={handleSubmit} buttonProps={{ w: '60%', alignSelf: 'center', borderRadius: '10px' }} />
      <Box mt={4} textAlign="center">
        <span
          style={{
            color: '#003459',
            cursor: 'pointer',
            fontWeight: 500,
            borderRadius: '10px',
            padding: '4px 0',
            display: 'inline-block',
            transition: 'color 0.2s',
            textDecoration: 'none',
          }}
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/signup');
          }}
          onMouseOver={e => (e.target.style.color = '#007ea7')}
          onMouseOut={e => (e.target.style.color = '#003459')}
        >
          ¿No tienes cuenta? Crear cuenta
        </span>
      </Box>
    </Box>
  );
};

export default Login;