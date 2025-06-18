import { useState } from 'react';
import { Box, Heading, Button, Input, FieldRoot, FieldLabel } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { RequestEmailModal, InfoModal } from '../Components/PasswordModals';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const response = await fetch('https://rtm.api.test.unknowngravity.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/');
    } else {
      let errorMsg = 'Error al iniciar sesión. Verifica tus credenciales.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {}
      setLoginError(errorMsg);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      const response = await fetch('https://rtm.api.test.unknowngravity.com/user/request-password-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al solicitar el reseteo de contraseña.' }));
        throw new Error(errorData.message || 'Error al solicitar el reseteo de contraseña');
      }
      setShowRequestModal(false);
      setInfoMessage("Si el correo existe, se ha enviado un enlace de reseteo de contraseña.");
      setShowInfoModal(true);
    } catch (error) {
      setShowRequestModal(false);
      setInfoMessage(error.message || "Error al procesar la solicitud. Inténtalo de nuevo más tarde.");
      setShowInfoModal(true);
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={8} p={6} bg="white" borderRadius="10px" color="#003459" style={{ border: '3px solid #003459', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459' }}>
      <Heading mb={6} color="#003459" fontWeight="bold" fontSize="2xl" fontFamily="inherit">Iniciar Sesión</Heading>
      <form onSubmit={handleSubmit}>
        <FieldRoot mb={4} required>
          <FieldLabel style={{ fontWeight: 600, color: '#003459', fontSize: '1rem' }}>Email</FieldLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Introduce tu email"
          />
        </FieldRoot>
        <FieldRoot mb={4} required>
          <FieldLabel style={{ fontWeight: 600, color: '#003459', fontSize: '1rem' }}>Password</FieldLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Introduce tu contraseña"
          />
        </FieldRoot>
        <Button
          type="submit"
          width="60%"
          alignSelf="center"
          borderRadius="10px"
          bgColor="#003459"
          color="white"
          style={{ display: 'block', margin: '0 auto' }}
          _hover={{ bg: '#005080', color: 'white' }}
        >
          Iniciar Sesión
        </Button>
      </form>
      {loginError && (
        <Box color="red.500" mt={2} mb={2} textAlign="center" fontWeight="bold">
          {loginError}
        </Box>
      )}
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
        <br />
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
            marginTop: '8px',
          }}
          onClick={() => setShowRequestModal(true)}
          onMouseOver={e => (e.target.style.color = '#007ea7')}
          onMouseOut={e => (e.target.style.color = '#003459')}
        >
          ¿Olvidaste tu contraseña?
        </span>
      </Box>
      <RequestEmailModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSend={handleForgotPassword}
      />
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Información"
        message={infoMessage}
      />
    </Box>
  );
};

export default Login;