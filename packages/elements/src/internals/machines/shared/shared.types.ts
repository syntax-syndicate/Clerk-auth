import type { SignInStrategy } from '@clerk/types';

// ================= Strategies ================= //

export type SignInStrategyName = SignInStrategy | 'oauth' | 'web3';
