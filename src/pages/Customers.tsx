import { useState } from 'react';
import { Search, Plus, Phone, MapPin, User, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

const Customers = () => {
  const { toast } = useToast();
  const { customers, addCustomer, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Please fill in name and phone number.",
        variant: "destructive"
      });
      return;
    }

    // Add customer to context
    addCustomer(formData);
    
    toast({
      title: "Success!",
      description: `${formData.name} has been added to your customers.`,
    });

    // Reset form
    setFormData({ name: '', phone: '', address: '', notes: '' });
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">Customers</h1>
          <p className="text-muted-foreground">Manage your valuable customers</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-warm shadow-soft">
              <Plus size={16} className="mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
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
                  Add Customer
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

      {/* Results count */}
      <p className="text-muted-foreground">
        Showing {filteredCustomers.length} of {customers.length} customers
      </p>

      {/* Customer List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => {
          const stats = getCustomerStats(customer.id);
          const lastOrderDate = getLastOrderDate(customer.id);
          
          return (
            <Card key={customer.id} className="shadow-soft hover:shadow-warm transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User size={18} className="text-primary" />
                          {customer.name}
                        </h3>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-secondary rounded-lg p-3">
                        <p className="text-muted-foreground">Total Orders</p>
                        <p className="font-semibold">{stats.totalOrders}</p>
                      </div>
                      <div className="bg-secondary rounded-lg p-3">
                        <p className="text-muted-foreground">Total Spent</p>
                        <p className="font-semibold">₹{stats.totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="bg-secondary rounded-lg p-3">
                        <p className="text-muted-foreground">Last Order</p>
                        <p className="font-semibold">{lastOrderDate}</p>
                      </div>
                    </div>

                    {customer.notes && (
                      <div className="bg-accent/10 rounded-lg p-3">
                        <p className="text-sm">
                          <span className="font-medium">Notes:</span> {customer.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 md:w-32">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit size={14} className="mr-2" />
                      Edit
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full">
                      New Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {customers.length === 0 ? 'No customers yet.' : 'No customers found matching your search.'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => customers.length === 0 ? setShowAddDialog(true) : setSearchTerm('')}
          >
            {customers.length === 0 ? 'Add First Customer' : 'Clear Search'}
          </Button>
        </div>
      )}

      {/* Stats Summary */}
      {customers.length > 0 && (
        <Card className="bg-gradient-cream shadow-soft">
          <CardHeader>
            <CardTitle className="font-elegant text-primary">Customer Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  ₹{orders.reduce((sum, order) => sum + order.paidAmount, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Customers;