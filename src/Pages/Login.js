import { useState } from 'react';
import { Box, Heading, Button } from '@chakra-ui/react';
import AuthForm from '../Components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { RequestEmailModal, InfoModal } from '../Components/PasswordModals';



const Login = () => {
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

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

  const handleForgotPassword = async (email) => {
    try {
      const response = await fetch('http://localhost:3000/user/request-password-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        // Intenta obtener un mensaje de error del cuerpo de la respuesta si está disponible
        const errorData = await response.json().catch(() => ({ message: 'Error al solicitar el reseteo de contraseña.' }));
        throw new Error(errorData.message || 'Error al solicitar el reseteo de contraseña');
      }

      setShowRequestModal(false); // Cierra el modal de solicitud de email
      setInfoMessage("Si el correo existe, se ha enviado un enlace de reseteo de contraseña.");
      setShowInfoModal(true); // Muestra el modal de información
    } catch (error) {
      console.error("Error en handleForgotPassword:", error);
      setShowRequestModal(false);
      setInfoMessage(error.message || "Error al procesar la solicitud. Inténtalo de nuevo más tarde.");
      setShowInfoModal(true);
    }
  };

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