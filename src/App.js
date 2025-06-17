import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './Components/Navbar';
import { jwtDecode } from 'jwt-decode';
import Home from './Pages/Home';
import AssetDetail from './Pages/AssetDetails';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Account from './Pages/Account';
import CreateAsset from './Pages/CreateAsset';
import AssetDetails from './Pages/AssetDetails';
import ImportAsset from './Pages/ImportAsset';
import ResetPasswordPage from './Pages/ResetPasswordPage'; // Importar la nueva página
import Offers from './Pages/Offers';
import { useState, useEffect } from 'react';

async function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    console.log('Verificando token:', decoded);


    // Comprueba si el token ha expirado
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return false;
    }

    // Comprobar que el token es el mismo que en la base de datos
    const email = decoded.email;
    try {
      const body = JSON.stringify({ email: email });
      const response = await fetch('http://localhost:3000/user/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: body
      });

      if (!response.ok) {
        throw new Error('Error al obtener los activos');
      }

      const data = await response.json();
      if (data.token !== token) {
        return false;
      }

    } catch (error) {
      console.error('Error fetching user token:', error);
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}


function PrivateRoute({ children }) {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsValid(false);
      return;
    }
    isTokenValid(token).then(setIsValid);
  }, []);

  if (isValid === null) {
    // Puedes mostrar un spinner o null mientras valida
    return null;
  }

  return isValid ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Box minH="100vh" bg="gray.50">
        <Navbar />
        <Box p={4}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/asset/:id"
              element={
                <PrivateRoute>
                  <AssetDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route
              path="/createAsset"
              element={
                <PrivateRoute>
                  <CreateAsset />
                </PrivateRoute>
              }
            />
                        <Route
              path="/importAsset"
              element={
                <PrivateRoute>
                  <ImportAsset />
                </PrivateRoute>
              }
            />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* Añadir la nueva ruta */}
            <Route
              path="/offers"
              element={
                <PrivateRoute>
                  <Offers />
                </PrivateRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;