import { Box } from '@chakra-ui/react';
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
  

  return (
    <Box maxW="400px" mx="auto" mt={8} p={6} bg="white" borderRadius="10px" color="#003459" style={{ border: '3px solid #003459', boxShadow: '0 8px 32px 0 rgba(0,52,89,0.25), 0 3px 12px 0 #003459' }}>
      <AuthForm isSignup onAuth={handleSubmit} buttonProps={{ w: '60%', alignSelf: 'center', borderRadius: '10px' }} />
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
          onClick={() => navigate('/login')}
          onMouseOver={e => (e.target.style.color = '#007ea7')}
          onMouseOut={e => (e.target.style.color = '#003459')}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </span>
      </Box>
    </Box>
  );
};

export default Signup;