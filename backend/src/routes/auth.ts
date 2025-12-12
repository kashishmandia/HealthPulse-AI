import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware.js';
import * as authService from '../services/auth.js';

const router = Router();

/**
 * Register patient
 */
router.post('/register/patient', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth } = req.body;

    if (!email || !password || !firstName || !lastName || !dateOfBirth) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await authService.registerPatient(
      email,
      password,
      firstName,
      lastName,
      new Date(dateOfBirth)
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Register provider
 */
router.post('/register/provider', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, licenseNumber, specialization, hospital } =
      req.body;

    if (!email || !password || !firstName || !lastName || !licenseNumber || !specialization) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await authService.registerProvider(
      email,
      password,
      firstName,
      lastName,
      licenseNumber,
      specialization,
      hospital
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * Get current user
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId!);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
