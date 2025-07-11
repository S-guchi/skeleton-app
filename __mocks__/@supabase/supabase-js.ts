const mockFrom = (table: string) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  overlaps: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  not: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  then: jest.fn().mockResolvedValue({ data: null, error: null }),
});

const mockStorage = {
  from: jest.fn((bucket: string) => ({
    upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
    download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
    remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    list: jest.fn().mockResolvedValue({ data: [], error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com' } }),
  })),
};

const mockAuth = {
  getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
  getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
  signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
  signInAnonymously: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
  resetPasswordForEmail: jest.fn().mockResolvedValue({ data: {}, error: null }),
  updateUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  }),
};

export const createClient = jest.fn(() => ({
  from: mockFrom,
  storage: mockStorage,
  auth: mockAuth,
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  channel: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    unsubscribe: jest.fn(),
  }),
  removeAllChannels: jest.fn().mockResolvedValue(null),
}));