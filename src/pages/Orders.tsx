import { useState } from 'react';
import { Plus, Search, Eye, CreditCard, CheckCircle, Clock, XCircle, Download, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const Orders = () => {
  const { orders, customers, sarees, addOrder, addPayment, updateOrderStatus } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [showStatusChange, setShowStatusChange] = useState<string | null>(null);
  
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

  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer?.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = () => {
    if (!newOrderData.customerId || newOrderData.items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and add at least one item.",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = newOrderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const orderData = {
      ...newOrderData,
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      payments: [],
      status: 'Pending' as const,
      date: new Date().toISOString()
    };

    addOrder(orderData);
    
    toast({
      title: "Success!",
      description: "Order created successfully.",
    });

    setNewOrderData({ customerId: '', items: [], notes: '' });
    setShowNewOrder(false);
  };

  const handleAddPayment = (orderId: string) => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }

    const payment = {
      amount: parseFloat(paymentData.amount),
      method: paymentData.method,
      date: new Date().toISOString(),
      notes: paymentData.notes
    };

    addPayment(orderId, payment);
    
    toast({
      title: "Success!",
      description: "Payment added successfully.",
    });

    setPaymentData({ amount: '', method: 'Cash', notes: '' });
    setShowPayment(null);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
    toast({
      title: "Status Updated!",
      description: `Order status changed to ${newStatus}.`,
    });
    setShowStatusChange(null);
  };

  const generateInvoice = (order: any) => {
    const doc = new jsPDF();
    const customer = customers.find(c => c.id === order.customerId);
    
    // Header
    doc.setFontSize(20);
    doc.text('Ama Sarees', 20, 30);
    doc.setFontSize(12);
    doc.text('Invoice', 20, 45);
    
    // Order details
    doc.text(`Order ID: ${order.id}`, 20, 60);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 70);
    doc.text(`Customer: ${customer?.name || 'N/A'}`, 20, 80);
    doc.text(`Phone: ${customer?.phone || 'N/A'}`, 20, 90);
    
    // Items
    let yPos = 110;
    doc.text('Items:', 20, yPos);
    yPos += 10;
    
    order.items.forEach((item: any) => {
      const saree = sarees.find(s => s.id === item.sareeId);
      doc.text(`${saree?.name || 'Unknown'} - Qty: ${item.quantity} - ₹${item.price}`, 25, yPos);
      yPos += 10;
    });
    
    // Total
    yPos += 10;
    doc.text(`Total Amount: ₹${order.totalAmount}`, 20, yPos);
    doc.text(`Paid Amount: ₹${order.paidAmount}`, 20, yPos + 10);
    doc.text(`Due Amount: ₹${order.dueAmount}`, 20, yPos + 20);
    
    // Save the PDF
    doc.save(`invoice-${order.id}.pdf`);
    toast({
      title: "Success!",
      description: "Invoice downloaded successfully!",
    });
  };

  const addItemToOrder = (sareeId: string) => {
    const saree = sarees.find(s => s.id === sareeId);
    if (!saree || saree.stock <= 0) {
      toast({
        title: "Error",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and payments</p>
        </div>
        <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
          <DialogTrigger asChild>
            <Button className="gradient-warm shadow-soft">
              <Plus size={16} className="mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                    {newOrderData.items.map((item, index) => {
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
                <Button onClick={handleCreateOrder} className="flex-1">
                  Create Order
                </Button>
                <Button variant="outline" onClick={() => setShowNewOrder(false)}>
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

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const customer = customers.find(c => c.id === order.customerId);
          return (
            <Card key={order.id} className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      Order #{order.id.slice(-6)}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {customer?.name} • {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="font-bold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid Amount</p>
                      <p className="font-semibold text-green-600">₹{order.paidAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Amount</p>
                      <p className="font-semibold text-red-600">₹{order.dueAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.dueAmount > 0 && (
                      <Dialog open={showPayment === order.id} onOpenChange={(open) => setShowPayment(open ? order.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <CreditCard size={14} className="mr-2" />
                            Add Payment
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
                                max={order.dueAmount}
                                placeholder={`Max: ₹${order.dueAmount}`}
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="method">Payment Method *</Label>
                              <Select value={paymentData.method} onValueChange={(value: any) => 
                                setPaymentData(prev => ({ ...prev, method: value }))
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
                              <Button onClick={() => handleAddPayment(order.id)} className="flex-1">
                                Add Payment
                              </Button>
                              <Button variant="outline" onClick={() => setShowPayment(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {/* Manual Status Change */}
                    <Dialog open={showStatusChange === order.id} onOpenChange={(open) => setShowStatusChange(open ? order.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit size={14} className="mr-2" />
                          Change Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Order Status</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Status: {getStatusBadge(order.status)}</Label>
                          </div>
                          <div>
                            <Label htmlFor="newStatus">New Status *</Label>
                            <Select onValueChange={(value) => handleStatusChange(order.id, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select new status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Partial">Partial Payment</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>💡 <strong>Real-time scenarios:</strong></p>
                            <p>• <strong>Partial</strong>: Customer paid some amount, rest is due</p>
                            <p>• <strong>Pending</strong>: No payment received yet</p>
                            <p>• <strong>Paid</strong>: Full amount received</p>
                            <p>• <strong>Cancelled</strong>: Order cancelled</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" variant="outline" onClick={() => generateInvoice(order)}>
                      <Download size={14} className="mr-2" />
                      Invoice
                    </Button>
                  </div>

                  {order.payments.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Payment History</p>
                      <div className="space-y-2">
                        {order.payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-2 bg-secondary rounded text-sm">
                            <div>
                              <p>₹{payment.amount.toLocaleString()} • {payment.method}</p>
                              <p className="text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                            </div>
                            {payment.notes && <p className="text-muted-foreground">{payment.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowNewOrder(true)}
          >
            Create First Order
          </Button>
        </div>
      )}
    </div>
  );
};

export default Orders;