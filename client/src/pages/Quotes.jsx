import React, { useState, useEffect } from "react";
import api from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  FileText,
  Download,
  Send,
  Eye,
  DollarSign,
  Calendar,
  User,
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadInvoicePDF, generateInvoicePDF } from '../utils/pdfGenerator';

const statusStyles = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  sent: 'bg-blue-50 text-blue-600 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  overdue: 'bg-rose-50 text-rose-600 border-rose-200',
  cancelled: 'bg-slate-50 text-slate-400 border-slate-200',
};

export default function Quotes() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    total: '',
    notes: '',
    due_date: ''
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get('/invoices');
      return response.data.invoices || [];
    },
    initialData: [],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get('/clients');
      return response.data.clients || [];
    },
    initialData: [],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data) => api.post('/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      setIsCreateOpen(false);
      setNewInvoice({ client_id: '', total: '', notes: '', due_date: '' });
    },
    onError: (err) => {
      toast.error('Failed to create invoice');
      console.error("Create Invoice Error:", err);
    }
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/invoices/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
      setIsCreateOpen(false);
      setEditingInvoice(null);
      setNewInvoice({ client_id: '', total: '', notes: '', due_date: '' });
    },
    onError: (err) => {
      toast.error('Failed to update invoice');
      console.error("Update Invoice Error:", err);
    }
  });

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = (invoiceId, newStatus) => {
    updateInvoiceMutation.mutate({ id: invoiceId, status: newStatus });
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setNewInvoice({
      client_id: invoice.client_id,
      total: invoice.total,
      notes: invoice.notes || '',
      due_date: invoice.due_date ? invoice.due_date.split('T')[0] : ''
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting invoice payload:", newInvoice);

    if (!newInvoice.client_id) {
      toast.error("Please select a client");
      return;
    }
    if (!newInvoice.total || parseFloat(newInvoice.total) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (editingInvoice) {
      updateInvoiceMutation.mutate({
        id: editingInvoice.id,
        ...newInvoice,
        total: parseFloat(newInvoice.total)
      });
    } else {
      createInvoiceMutation.mutate({
        ...newInvoice,
        total: parseFloat(newInvoice.total)
      });
    }
  };

  const handleViewPDF = async (invoice) => {
    try {
      console.log("Generating PDF for invoice:", invoice);
      const doc = await generateInvoicePDF(invoice, 'Triponic');
      const blobUrl = doc.output('bloburl');
      const newWindow = window.open(blobUrl, '_blank');
      if (!newWindow) {
        toast.error('Please allow popups to view the invoice PDF');
      }
    } catch (error) {
      console.error("Error viewing PDF:", error);
      toast.error("Failed to generate PDF for viewing");
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      console.log("Downloading PDF for invoice:", invoice);
      await downloadInvoicePDF(invoice, 'Triponic');
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  // Calculate stats
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === 'sent' || i.status === 'draft').reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Financial Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Track your agency's revenue and invoices
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 text-slate-600"
            onClick={() => toast.info('Ask Tono: "Create an invoice for [Client] for $[Amount]"')}
          >
            <Plus className="w-4 h-4 mr-2" />
            AI Create
          </Button>
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg shadow-indigo-500/5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-indigo-100 font-medium text-sm">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</h3>
              <p className="text-indigo-100/80 text-xs mt-4">Lifetime earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 font-medium text-sm">Pending</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">${pendingAmount.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-4">Awaiting payment</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 font-medium text-sm">Paid Invoices</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-2">{paidCount}</h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-4">Successfully processed</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client, ID, or amount..."
          className="pl-11 h-12 bg-white border-slate-200 shadow-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        <AnimatePresence>
          {isLoading ? (
            [1, 2, 3].map(i => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredInvoices.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No invoices found</h3>
              <p className="text-slate-500">Try adjusting your search or create a new one.</p>
            </motion.div>
          ) : (
            filteredInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row items-stretch">
                      {/* Left Status Stripe */}
                      <div className={`w-full lg:w-1.5 ${invoice.status === 'paid' ? 'bg-emerald-500' : invoice.status === 'sent' ? 'bg-blue-500' : 'bg-slate-300'}`} />

                      <div className="flex-1 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                            {invoice.client?.full_name?.charAt(0) || '#'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{invoice.client?.full_name || 'Unknown Client'}</h4>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">#{invoice.invoice_number || invoice.id.slice(0, 8)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 text-sm">
                          <div className="flex flex-col">
                            <span className="text-slate-400 text-xs mb-0.5">Amount</span>
                            <span className="font-bold text-slate-900">${parseFloat(invoice.total).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-400 text-xs mb-0.5">Date</span>
                            <span className="text-slate-600">{format(new Date(invoice.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-400 text-xs mb-0.5">Status</span>
                            <Badge variant="outline" className={`capitalize ${statusStyles[invoice.status] || statusStyles.draft}`}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900" onClick={() => handleViewPDF(invoice)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900" onClick={() => handleDownloadPDF(invoice)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900" onClick={() => handleEditInvoice(invoice)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              className="bg-slate-900 text-white hover:bg-slate-800 h-8 text-xs"
                              onClick={() => handleStatusChange(invoice.id, 'sent')}
                            >
                              Send
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs"
                              onClick={() => handleStatusChange(invoice.id, 'paid')}
                            >
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) {
          setEditingInvoice(null);
          setNewInvoice({ client_id: '', total: '', notes: '', due_date: '' });
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={newInvoice.client_id}
                onValueChange={(val) => setNewInvoice({ ...newInvoice, client_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newInvoice.total}
                  onChange={(e) => setNewInvoice({ ...newInvoice, total: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                placeholder="e.g. Trip to Paris deposit"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending} className="bg-slate-900 text-white hover:bg-slate-800">
                {createInvoiceMutation.isPending || updateInvoiceMutation.isPending ? 'Saving...' : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}