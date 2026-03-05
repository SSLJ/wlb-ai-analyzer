import { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button
} from "@mui/material";

export default function Login() {

  const allowedDomains = ["rajagiri.edu.in", "rajagiri.edu.in"];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {

  if (!isAllowedEmail(email)) {
    alert("Please use your organization email");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created!");
  } catch (err) {
    alert(err.message);
  }
};

  const signIn = async () => {

  if (!isAllowedEmail(email)) {
    alert("Only organization emails allowed");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
};

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const isAllowedEmail = (email) => {
  const domain = email.split("@")[1];
  return allowedDomains.includes(domain);
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        overflow: "hidden"
      }}
    >
      <Container maxWidth="false">

        <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
          <CardContent>

            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 4, fontWeight: "bold" }}
            >
              Work Life Balance AI
            </Typography>

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, borderRadius: 3 }}
              onClick={signIn}
            >
              Login
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              sx={{ mt: 2, borderRadius: 3 }}
              onClick={signUp}
            >
              Create Account
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 2, borderRadius: 3 }}
              onClick={googleLogin}
            >
              Login with Google
            </Button>

          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}