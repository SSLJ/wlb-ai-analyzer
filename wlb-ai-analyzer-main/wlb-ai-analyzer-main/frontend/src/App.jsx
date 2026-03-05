import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import ModernQuestionnaire from "./ModernQuestionnaire";
import Dashboard from "./Dashboard";
import Login from "./Login";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from "@mui/material";

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("questions");

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();

  }, []);

  if (loading) return <h2>Loading...</h2>;

  if (!user) return <Login />;

  return (
    <Box>

      {/* Header */}
      <AppBar position="static" sx={{ background: "#6366f1" }}>
        <Toolbar>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Work Life Balance AI
          </Typography>

          <Typography sx={{ mr: 2 }}>
            {user.displayName || user.email}
          </Typography>

          <Button color="inherit" onClick={() => signOut(auth)}>
            Logout
          </Button>

        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>

        {page === "questions" && (
          <ModernQuestionnaire
            onComplete={() => setPage("dashboard")}
          />
        )}

        {page === "dashboard" && (
          <Dashboard />
        )}

      </Box>

    </Box>
  );
}

export default App;