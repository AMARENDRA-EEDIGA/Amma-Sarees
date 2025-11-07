import { useState, useEffect } from 'react';
import { Plus, Search, Eye, CreditCard, CheckCircle, Clock, XCircle, Download, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp, Order } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const Orders = () => {
  const { orders, customers, sarees, addOrder, addCustomer, addPayment, updateOrderStatus, cancelOrder, deleteOrder, loading } = useApp();
  const { user, isAdmin, ensureCustomerProfile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [showStatusChange, setShowStatusChange] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  
  // New Order Form State
  const [newOrderData, setNewOrderData] = useState({
    customerId: '',
    items: [] as { sareeId: string; quantity: number; price: number }[],
    notes: ''
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'Cash' as 'Cash' | 'UPI' | 'Other',
    notes: ''
  });
  
  // Optimized loading - show partial content while loading
  const isInitialLoading = loading && orders.length === 0;



  // Simple loading state reset
  useEffect(() => {
    if (!loading) {
      setIsCreatingOrder(false);
      setIsAddingPayment(false);
      setIsCancellingOrder(false);
      setIsDeletingOrder(false);
    }
  }, [loading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle size={16} className="text-green-500" />;
      case 'Partial': return <Clock size={16} className="text-yellow-500" />;
      case 'Cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'Partial': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Partial Payment</Badge>;
      case 'Cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  console.log('Current user:', user);
  console.log('All orders:', orders);
  console.log('Customer logins:', JSON.parse(localStorage.getItem('customerLogins') || '[]'));
  
  // Auto-fix customer ID mismatch for customers
  useEffect(() => {
    if (!isAdmin && user && orders.length > 0) {
      const userOrderExists = orders.some(order => order.customerId === user.customerId);
      if (!userOrderExists) {
        // Find correct customerId by matching customer email
        const correctOrder = orders.find(order => {
          const customer = customers.find(c => c.id === order.customerId);
          return customer?.email === user.email;
        });
        
        if (correctOrder) {
          const correctCustomerId = correctOrder.customerId;
          // Update user profile
          const updatedUser = { ...user, customerId: correctCustomerId };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update login credentials
          const customerLogins = JSON.parse(localStorage.getItem('customerLogins') || '[]');
          const loginIndex = customerLogins.findIndex((login: any) => login.email === user.email);
          if (loginIndex !== -1) {
            customerLogins[loginIndex].customerId = correctCustomerId;
            localStorage.setItem('customerLogins', JSON.stringify(customerLogins));
          }
          
          // Force re-render by updating user state
          window.location.reload();
        }
      }
    }
  }, [user, orders, customers, isAdmin]);

  const filteredOrders = orders.filter(order => {
    // For customers, STRICTLY show only their own orders
    if (!isAdmin) {
      if (!user?.customerId) return false;
      if (order.customerId !== user.customerId) return false;
    }
    
    // For admin, show all orders with search/filter
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = !searchTerm || 
                         customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer?.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async () => {
    // For customers, auto-set their customer ID
    let customerId = newOrderData.customerId;
    if (!isAdmin) {
      // Ensure customer profile exists
      customerId = await ensureCustomerProfile();
      if (!customerId) {
        toast({
          title: "❌ Error",
          description: "Failed to create customer profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if ((!customerId && isAdmin) || newOrderData.items.length === 0) {
      toast({
        title: "❌ Validation Error",
        description: isAdmin ? "Please select a customer and add at least one item." : "Please add at least one item to your order.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      const totalAmount = newOrderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const orderData = {
        ...newOrderData,
        customerId,
        totalAmount,
        paidAmount: 0,
        dueAmount: totalAmount,
        payments: [],
        status: 'Pending' as const,
        date: new Date().toISOString()
      };

      await addOrder(orderData);
      
      // Reset state BEFORE showing success to prevent white page
      setNewOrderData({ customerId: '', items: [], notes: '' });
      setShowNewOrder(false);
      setViewMode('table');
      setSelectedOrder(null);
      setIsCreatingOrder(false);
      
      // Show success message after state reset
      toast({
        title: "Success!",
        description: "Order created successfully.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
    } catch (error) {
      console.error('Order creation error:', error);
      setIsCreatingOrder(false);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to create order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddPayment = async (orderId: string) => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast({
        title: "❌ Validation Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }

    setIsAddingPayment(true);
    
    try {
      const payment = {
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        date: new Date().toISOString(),
        notes: paymentData.notes
      };

      await addPayment(orderId, payment);
      
      toast({
        title: "Success!",
        description: "Payment added successfully.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment.",
        variant: "destructive"
      });
    } finally {
      setIsAddingPayment(false);
      setPaymentData({ amount: '', method: 'Cash', notes: '' });
      setShowPayment(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'Pending' | 'Partial' | 'Paid' | 'Cancelled') => {
    if (newStatus === 'Cancelled') {
      setShowStatusChange(null);
      setShowCancelConfirm(orderId);
      return;
    }
    
    try {
      await updateOrderStatus(orderId, newStatus);
      
      toast({
        title: "✅ Status Updated!",
        description: `Order status changed to ${newStatus}.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error('Status change error:', error);
      toast({
        title: "❌ Error",
        description: "Failed to update order status.",
        variant: "destructive"
      });
    } finally {
      setShowStatusChange(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      setShowCancelConfirm(null);
      return;
    }
    
    if (order.paidAmount > 0) {
      toast({
        title: "❌ Cannot Cancel Order",
        description: "Cannot cancel order with payments. Please refund payments first.",
        variant: "destructive"
      });
      setShowCancelConfirm(null);
      return;
    }
    
    setIsCancellingOrder(true);
    
    try {
      await cancelOrder(orderId);
      
      toast({
        title: "✅ Order Cancelled!",
        description: "Order has been cancelled and stock has been restored.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
    } catch (error: unknown) {
      console.error('Cancel order error:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to cancel order.",
        variant: "destructive"
      });
    } finally {
      setIsCancellingOrder(false);
      setShowCancelConfirm(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setIsDeletingOrder(true);
    
    try {
      await deleteOrder(orderId);
      
      toast({
        title: "✅ Order Deleted!",
        description: "Order has been permanently deleted.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
    } catch (error: unknown) {
      console.error('Delete order error:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to delete order.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingOrder(false);
      setShowDeleteConfirm(null);
    }
  };

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF();
    const customer = customers.find(c => c.id === order.customerId);
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Ama Sarees', 20, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Elegant Textiles at Home', 20, 32);
    
    // Invoice title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 150, 25);
    
    // Order details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: INV-${order.id.slice(-8).toUpperCase()}`, 20, 50);
    doc.text(`Order ID: ${order.id.slice(-8)}`, 20, 57);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString('en-IN')}`, 20, 64);
    doc.text(`Status: ${order.status}`, 20, 71);
    
    // Customer details
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`${customer?.name || 'N/A'}`, 20, 92);
    doc.text(`${customer?.phone || 'N/A'}`, 20, 99);
    if (customer?.address) {
      const addressLines = customer.address.match(/.{1,40}/g) || [customer.address];
      addressLines.forEach((line, index) => {
        doc.text(line, 20, 106 + (index * 7));
      });
    }
    
    // Items table header
    let yPos = 130;
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, yPos);
    doc.text('Category', 80, yPos);
    doc.text('Qty', 120, yPos);
    doc.text('Price', 140, yPos);
    doc.text('Total', 170, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    // Items
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    let itemTotal = 0;
    
    order.items.forEach((item) => {
      const saree = sarees.find(s => s.id === item.sareeId);
      const itemName = saree?.name || 'Unknown Item';
      const category = saree?.category || 'N/A';
      const lineTotal = item.quantity * item.price;
      itemTotal += lineTotal;
      
      // Wrap long item names
      const nameLines = itemName.length > 25 ? [itemName.substring(0, 25) + '...'] : [itemName];
      nameLines.forEach((line, index) => {
        doc.text(line, 20, yPos + (index * 7));
      });
      
      doc.text(category, 80, yPos);
      doc.text(String(item.quantity), 120, yPos);
      doc.text('Rs.' + String(item.price), 140, yPos);
      doc.text('Rs.' + String(lineTotal), 170, yPos);
      
      yPos += Math.max(7, nameLines.length * 7);
    });
    
    // Totals
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal: Rs.' + String(order.totalAmount), 140, yPos);
    doc.text('Paid: Rs.' + String(order.paidAmount), 140, yPos + 7);
    doc.text('Balance Due: Rs.' + String(order.dueAmount), 140, yPos + 14);
    
    // Payment history
    if (order.payments && order.payments.length > 0) {
      yPos += 25;
      doc.setFont('helvetica', 'bold');
      doc.text('Payment History:', 20, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      order.payments.forEach((payment) => {
        const paymentDate = new Date(payment.date).toLocaleDateString('en-IN');
        const paymentText = paymentDate + ' - Rs.' + String(payment.amount) + ' (' + payment.method + ')';
        doc.text(paymentText, 20, yPos);
        yPos += 7;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 20, 280);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 20, 285);
    
    // Save the PDF
    doc.save(`invoice-${order.id.slice(-8)}.pdf`);
    toast({
      title: "✅ Success!",
      description: "Invoice downloaded successfully!",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const addItemToOrder = (sareeId: string) => {
    const saree = sarees.find(s => s.id === sareeId);
    if (!saree || saree.stock <= 0) {
      toast({
        title: "❌ Error",
        description: "Saree is out of stock.",
        variant: "destructive"
      });
      return;
    }

    const existingItem = newOrderData.items.find(item => item.sareeId === sareeId);
    if (existingItem) {
      setNewOrderData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.sareeId === sareeId 
            ? { ...item, quantity: Math.min(item.quantity + 1, saree.stock) }
            : item
        )
      }));
    } else {
      setNewOrderData(prev => ({
        ...prev,
        items: [...prev.items, { sareeId, quantity: 1, price: saree.price }]
      }));
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('detail');
  };

  // Prevent rendering detail view if data is inconsistent
  if (viewMode === 'detail' && selectedOrder) {
    const customer = customers.find(c => c.id === selectedOrder.customerId);
    
    // Safety check - if order is not found in current orders list, go back to table view
    const currentOrder = orders.find(o => o.id === selectedOrder.id);
    if (!currentOrder) {
      setViewMode('table');
      setSelectedOrder(null);
    } else {
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('table')}>
            ← Back to List
          </Button>
          <h1 className="font-elegant text-2xl font-bold text-primary">Order #{selectedOrder.id.slice(-6)}</h1>
          {getStatusBadge(selectedOrder.status)}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="font-semibold">{customer?.name}</p>
                  <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                  <p className="text-sm">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-lg font-bold text-primary">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">₹{selectedOrder.paidAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Paid Amount</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">₹{selectedOrder.dueAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Due Amount</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Items</label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items.map((item, index: number) => {
                    const saree = sarees.find(s => s.id === item.sareeId);
                    return (
                      <div key={index} className="flex justify-between items-center p-2 bg-accent/10 rounded">
                        <div>
                          <p className="font-medium">{saree?.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-semibold">₹{(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrder.payments.length > 0 ? (
                <div className="space-y-3">
                  {selectedOrder.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{payment.method} • {new Date(payment.date).toLocaleDateString()}</p>
                        {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                {isAdmin && selectedOrder.dueAmount > 0 && selectedOrder.status !== 'Cancelled' && (
                  <Dialog open={showPayment === selectedOrder.id} onOpenChange={(open) => setShowPayment(open ? selectedOrder.id : null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full sm:flex-1">
                        <CreditCard size={16} className="mr-2" />
                        <span className="hidden sm:inline">Add Payment</span>
                        <span className="sm:hidden">Payment</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="amount">Amount (₹) *</Label>
                          <Input
                            id="amount"
                            type="number"
                            max={selectedOrder.dueAmount}
                            placeholder={`Max: ₹${selectedOrder.dueAmount}`}
                            value={paymentData.amount}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="method">Payment Method *</Label>
                          <Select value={paymentData.method} onValueChange={(value) => 
                            setPaymentData(prev => ({ ...prev, method: value as 'Cash' | 'UPI' | 'Other' }))
                          }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="paymentNotes">Notes</Label>
                          <Textarea
                            id="paymentNotes"
                            placeholder="Payment notes..."
                            value={paymentData.notes}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={() => handleAddPayment(selectedOrder.id)} className="flex-1" disabled={isAddingPayment}>
                            {isAddingPayment ? 'Adding...' : 'Add Payment'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowPayment(null)} disabled={isAddingPayment}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Button variant="outline" onClick={() => generateInvoice(selectedOrder)} className="w-full sm:flex-1">
                  <Download size={16} className="mr-2" />
                  <span className="hidden sm:inline">Download Invoice</span>
                  <span className="sm:hidden">Invoice</span>
                </Button>
                {isAdmin && selectedOrder.status !== 'Cancelled' && selectedOrder.paidAmount === 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowCancelConfirm(selectedOrder.id)}
                    className="w-full sm:flex-1"
                  >
                    <XCircle size={16} className="mr-2" />
                    <span className="hidden sm:inline">Cancel Order</span>
                    <span className="sm:hidden">Cancel</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
    }
  }

  // Prevent white page by ensuring we always render something
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-20 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary">{filteredOrders.length}</div>
              <p className="text-sm text-muted-foreground mt-1">{isAdmin ? 'Total Orders' : 'My Orders'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600">{filteredOrders.filter(o => o.status === 'Paid').length}</div>
              <p className="text-sm text-muted-foreground mt-1">Completed Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-yellow-600">
                {isAdmin 
                  ? filteredOrders.filter(o => o.status === 'Partial').length
                  : filteredOrders.filter(o => o.status === 'Pending').length
                }
              </div>
              <p className="text-sm text-muted-foreground mt-1">{isAdmin ? 'Partial Payments' : 'Pending Orders'}</p>
            </CardContent>
          </Card>
          {isAdmin && (
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600">
                  ₹{filteredOrders.reduce((sum, order) => sum + order.paidAmount, 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">{isAdmin ? 'Orders' : 'My Orders'}</h1>
          <p className="text-muted-foreground">{isAdmin ? 'Manage customer orders and payments' : 'View your order history and track status'}</p>
        </div>
        <Dialog open={showNewOrder} onOpenChange={(open) => {
          if (!open) {
            // Reset form when closing dialog
            setNewOrderData({ customerId: '', items: [], notes: '' });
          }
          setShowNewOrder(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-warm shadow-soft">
              <Plus size={16} className="mr-2" />
              {isAdmin ? 'New Order' : 'Place Order'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>{isAdmin ? 'Create New Order' : 'Place Your Order'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isAdmin && (
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={newOrderData.customerId} onValueChange={(value) => 
                    setNewOrderData(prev => ({ ...prev, customerId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Add Sarees</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {sarees.filter(s => s.stock > 0).map((saree) => (
                    <div key={saree.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{saree.name}</p>
                        <p className="text-sm text-muted-foreground">₹{saree.price} • Stock: {saree.stock}</p>
                      </div>
                      <Button size="sm" onClick={() => addItemToOrder(saree.id)}>
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {newOrderData.items.length > 0 && (
                <div>
                  <Label>Order Items</Label>
                  <div className="space-y-2">
                    {newOrderData.items.map((item, index: number) => {
                      const saree = sarees.find(s => s.id === item.sareeId);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded">
                          <div>
                            <p className="font-medium">{saree?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setNewOrderData(prev => ({
                              ...prev,
                              items: prev.items.filter((_, i) => i !== index)
                            }))}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                    <div className="text-right font-bold">
                      Total: ₹{newOrderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Order notes..."
                  value={newOrderData.notes}
                  onChange={(e) => setNewOrderData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleCreateOrder} className="flex-1" disabled={isCreatingOrder}>
                  {isCreatingOrder ? (isAdmin ? 'Creating...' : 'Placing...') : (isAdmin ? 'Create Order' : 'Place Order')}
                </Button>
                <Button variant="outline" onClick={() => setShowNewOrder(false)} disabled={isCreatingOrder}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Orders</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Partial">Partial Payment</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer?.name}</p>
                        <p className="text-sm text-muted-foreground">{customer?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">₹{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹{order.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-red-600">₹{order.dueAmount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleView(order)}>
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {isAdmin && order.dueAmount > 0 && (
                            <DropdownMenuItem onClick={() => setShowPayment(order.id)}>
                              <CreditCard size={16} className="mr-2" />
                              Add Payment
                            </DropdownMenuItem>
                          )}
                          {isAdmin && order.status !== 'Cancelled' && (
                            <DropdownMenuItem onClick={() => setShowStatusChange(order.id)}>
                              <Edit size={16} className="mr-2" />
                              Change Status
                            </DropdownMenuItem>
                          )}
                          {order.status !== 'Cancelled' && order.paidAmount === 0 && (
                            <DropdownMenuItem 
                              onClick={() => setShowCancelConfirm(order.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <XCircle size={16} className="mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => generateInvoice(order)}>
                            <Download size={16} className="mr-2" />
                            Download Invoice
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem 
                              onClick={() => setShowDeleteConfirm(order.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPayment !== null} onOpenChange={(open) => setShowPayment(open ? showPayment : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter payment amount"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={paymentData.method} onValueChange={(value) => 
                setPaymentData(prev => ({ ...prev, method: value as 'Cash' | 'UPI' | 'Other' }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentNotes">Notes</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Payment notes..."
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={() => showPayment && handleAddPayment(showPayment)} className="flex-1" disabled={isAddingPayment}>
                {isAddingPayment ? 'Adding...' : 'Add Payment'}
              </Button>
              <Button variant="outline" onClick={() => setShowPayment(null)} disabled={isAddingPayment}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusChange !== null} onOpenChange={(open) => setShowStatusChange(open ? showStatusChange : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newStatus">New Status *</Label>
              <Select onValueChange={(value) => showStatusChange && handleStatusChange(showStatusChange, value as 'Pending' | 'Partial' | 'Paid' | 'Cancelled')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial Payment</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Cancelled" className="text-red-600">Cancel Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={showCancelConfirm !== null} onOpenChange={(open) => setShowCancelConfirm(open ? showCancelConfirm : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to cancel this order? This action will:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Mark the order as cancelled</li>
              <li>Restore stock for all items in the order</li>
              <li>This action cannot be undone</li>
            </ul>
            <div className="flex gap-4 pt-4">
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (showCancelConfirm && !isCancellingOrder) {
                    handleCancelOrder(showCancelConfirm);
                  }
                }}
                disabled={isCancellingOrder}
                className="flex-1"
              >
                {isCancellingOrder ? 'Cancelling...' : 'Yes, Cancel Order'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(null)}
                disabled={isCancellingOrder}
                className="flex-1"
              >
                Keep Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation Dialog */}
      <Dialog open={showDeleteConfirm !== null} onOpenChange={(open) => setShowDeleteConfirm(open ? showDeleteConfirm : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete this order? This action:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Will permanently remove the order from the system</li>
              <li>Cannot be undone</li>
              <li>Will not affect stock levels</li>
            </ul>
            <div className="flex gap-4 pt-4">
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (showDeleteConfirm && !isDeletingOrder) {
                    handleDeleteOrder(showDeleteConfirm);
                  }
                }}
                disabled={isDeletingOrder}
                className="flex-1"
              >
                {isDeletingOrder ? 'Deleting...' : 'Yes, Delete Order'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingOrder}
                className="flex-1"
              >
                Keep Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;