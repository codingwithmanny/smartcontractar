// Imports
// ========================================================
import { UUID } from "crypto";
import {
  ColumnType,
  Generated,
} from "kysely";

// Table Types
// ========================================================
interface Users {
  id: Generated<UUID>;
  email: string;
  createdAt: ColumnType<Date, string | undefined, never>
}

interface Todos {
  id: Generated<UUID>;
  userId: Generated<UUID>;
  todo: string;
  isComplete?: boolean;
  createdAt: ColumnType<Date, string | undefined, never>
}

interface Contracts {
  id: Generated<UUID>;
  contractId: string;
  ownerAddress: string;
  network: string;
  initState: string;
  sourceCode: string;
  totalTxs?: number;
  data: string;
  createdAt: ColumnType<Date, string | undefined, never>
}

interface Transactions {
  id: Generated<UUID>;
  contractId: string;
  transactionId: string;
  blockId?: string;
  blockHeight?: number;
  timestamp?: number;
  ownerAddress: string;
  inputs: string;
  before?: string;
  after?: string;
  error?: string;
  createdAt: ColumnType<Date, string | undefined, never>
}

interface Notifications {
  id: Generated<UUID>;
  contractId: string;
  jobId?: string;
  status: string;
  object: string;
  operator: string;
  value: string;
  valueType: string;
  email: string;
  cron: string;
  expirationType: string;
  expirationValue: string;
  retries: number;
  failedAttempts?: number;
  lastCheckedAt?: ColumnType<Date, string | undefined, never>
  successfulAttempts?: number;
  createdAt: ColumnType<Date, string | undefined, never>
}

// Types
// ========================================================
export interface Database {
  users: Users;
  todos: Todos;
  contracts: Contracts;
  transactions: Transactions;
  notifications: Notifications;
}
