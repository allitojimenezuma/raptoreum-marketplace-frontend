import { useState } from 'react';
import { Box, Button, Input, Heading, FieldRoot, FieldLabel } from '@chakra-ui/react';


const AuthForm = ({ isSignup, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAuth) {
      onAuth({ email, password, name });
    }
  };

  return (
    <Box maxW="400px" mx="auto" p={4} borderWidth="1px" borderRadius="lg">
      <Heading mb={4}>{isSignup ? 'Sign Up' : 'Log In'}</Heading>
      <form onSubmit={handleSubmit}>
        {isSignup && (
          <FieldRoot mb={4} required>
            <FieldLabel>Nombre</FieldLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </FieldRoot>
        )}


        <FieldRoot mb={4} required>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FieldRoot>


        <FieldRoot mb={4} required>
          <FieldLabel>Password</FieldLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </FieldRoot>
        <Button type="submit" width="full" bgColor="teal.950" >
          {isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </Button>
      </form>
    </Box>
  );
};

export default AuthForm;