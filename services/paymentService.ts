import { apiClient, BASE_URL } from './apiClient';
import { Transaction } from '../types';

const BACKEND_URL = BASE_URL.replace(/\/api$/, '');

const getFullUrl = (url?: string) => {
  if (!url) return '';
  const normalizedUrl = url.replace(/\\/g, '/').trim();
  if (!normalizedUrl) return '';

  let remappedPath = normalizedUrl;

  // Legacy format: /assets?bucket=local&file=<filename>
  // Backend now serves proof files from /uploads/<filename>
  if (/^\/?assets\?/i.test(remappedPath)) {
    const queryString = remappedPath.includes('?') ? remappedPath.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const file = params.get('file');
    if (file) {
      remappedPath = `/uploads/${file.replace(/^\/+/, '')}`;
    }
  }

  // Legacy path format: /assets/<filename>
  remappedPath = remappedPath.replace(/^\/?assets\//i, '/uploads/');

  if (remappedPath.startsWith('http')) return remappedPath;
  return `${BACKEND_URL}${remappedPath.startsWith('/') ? '' : '/'}${remappedPath}`;
};

const mapTransaction = (t: any): Transaction => ({
  id: t.id,
  userId: t.user_id,
  userEmail: t.user_email,
  userName: t.user_name,
  totalAmount: Number(t.total_amount),
  status: t.status,
  proofUrl: getFullUrl(t.proof_url || t.proofUrl),
  createdAt: t.created_at,
  items: (t.items || []).map((ti: any) => ({
    id: ti.id,
    itemId: ti.item_id,
    itemType: ti.item_type,
    title: ti.title,
    price: Number(ti.price),
  })),
});

export const paymentService = {
  async createTransaction(
    _userId: string,
    items: { id: string; type: 'course' | 'bundle'; title: string; price: number }[],
    totalAmount: number,
    proofFile: File,
  ): Promise<Transaction> {
    // 1. Upload proof image first via asset upload
    const proofForm = new FormData();
    proofForm.append('file', proofFile);
    const uploaded = await apiClient.upload<{ asset: any }>('/assets/upload', proofForm);
    const proofUrl = uploaded.asset?.file_url;

    // 2. Create transaction
    const data = await apiClient.post<{ transaction: any }>('/payments', {
      totalAmount,
      proofUrl,
      items: items.map(i => ({
        itemId: i.id,
        itemType: i.type,
        title: i.title,
        price: i.price,
      })),
    });
    return mapTransaction(data.transaction);
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    const data = await apiClient.get<{ transactions: any[] }>('/payments?status=pending');
    return (data.transactions || []).map(mapTransaction);
  },

  async getUserTransactions(_userId: string): Promise<Transaction[]> {
    const data = await apiClient.get<{ transactions: any[] }>('/payments/my');
    return (data.transactions || []).map(mapTransaction);
  },

  async getVerifiedTransactions(): Promise<Transaction[]> {
    const data = await apiClient.get<{ transactions: any[] }>('/payments?status=verified');
    return (data.transactions || []).map(mapTransaction);
  },

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const data = await apiClient.get<{ transaction: any }>(`/payments/${transactionId}`);
      return data.transaction ? mapTransaction(data.transaction) : null;
    } catch {
      return null;
    }
  },

  async verifyTransaction(transactionId: string, status: 'verified' | 'rejected', transaction?: Transaction): Promise<void> {
    await apiClient.patch(`/payments/${transactionId}/verify`, {
      status,
      userId: transaction?.userId,
      items: transaction?.items?.map(item => ({
        itemId: item.itemId,
        itemType: item.itemType,
        title: item.title,
        price: item.price,
      })),
    });
  },  
};
