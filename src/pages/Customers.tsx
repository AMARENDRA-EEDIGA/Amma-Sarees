import { useState } from 'react';
import { Search, Plus, Phone, MapPin, User, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Customer } from '@/contexts/AppContext';

const Customers = () => {
  const { toast } = useToast();
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getLastOrderDate = (customerId: string) => {
    const customerOrders = orders.filter(order => order.customerId === customerId);
    if (customerOrders.length === 0) return 'No orders yet';
    
    const lastOrder = customerOrders.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    return new Date(lastOrder.date).toLocaleDateString();
  };

  const getCustomerStats = (customerId: string) => {
    const customerOrders = orders.filter(order => order.customerId === customerId);
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.paidAmount, 0);
    return { totalOrders, totalSpent };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (customer: Customer) => {
    if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      try {
        await deleteCustomer(customer.id);
        toast({
          title: "Success",
          description: `${customer.name} has been deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete customer.",
          variant: "destructive"
        });
      }
    }
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('detail');
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes
    });
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in name and phone number.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedCustomer && showEditDialog) {
        await updateCustomer(selectedCustomer.id, formData);
        toast({
          title: "Success!",
          description: `${formData.name} has been updated.`,
        });
        setShowEditDialog(false);
      } else {
        await addCustomer(formData);
        toast({
          title: "Success!",
          description: `${formData.name} has been added to your customers.`,
        });
        setShowAddDialog(false);
      }
      
      setFormData({ name: '', phone: '', address: '', notes: '' });
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer.",
        variant: "destructive"
      });
    }
  };

  if (viewMode === 'detail' && selectedCustomer) {
    const stats = getCustomerStats(selectedCustomer.id);
    const customerOrders = orders.filter(order => order.customerId === selectedCustomer.id);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('table')}>
            ← Back to List
          </Button>
          <h1 className="font-elegant text-2xl font-bold text-primary">{selectedCustomer.name}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg font-semibold">{selectedCustomer.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-sm">{selectedCustomer.phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-sm">{selectedCustomer.address || 'No address provided'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm">{selectedCustomer.notes || 'No notes'}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleEdit(selectedCustomer)} className="flex-1">
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(selectedCustomer)}>
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-primary">₹{stats.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
              {customerOrders.length > 0 ? (
                <div className="space-y-2">
                  {customerOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-accent/10 rounded">
                      <div>
                        <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                        <Badge variant={order.status === 'Paid' ? 'default' : 'secondary'}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{customers.length}</div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{customers.filter(c => getCustomerStats(c.id).totalOrders > 0).length}</div>
            <p className="text-sm text-muted-foreground">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">₹{orders.reduce((sum, order) => sum + order.paidAmount, 0).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">Customers</h1>
          <p className="text-muted-foreground">Manage your valuable customers</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gradient-warm shadow-soft">
          <Plus size={16} className="mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                const lastOrderDate = getLastOrderDate(customer.id);
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{customer.address || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{stats.totalOrders}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">₹{stats.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{lastOrderDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleView(customer)}>
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(customer)}>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(customer)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setSelectedCustomer(null);
          setFormData({ name: '', phone: '', address: '', notes: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Priya Sharma"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="e.g., MG Road, Bangalore"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Customer preferences, special notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {showEditDialog ? 'Update Customer' : 'Add Customer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                setShowEditDialog(false);
                setSelectedCustomer(null);
                setFormData({ name: '', phone: '', address: '', notes: '' });
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;