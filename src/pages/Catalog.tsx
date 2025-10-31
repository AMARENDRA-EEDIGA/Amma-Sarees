import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Saree } from '@/contexts/AppContext';

const categories = ['All', 'Silk', 'Cotton', 'Partywear', 'Designer', 'Handloom'];

const Catalog = () => {
  const navigate = useNavigate();
  const { sarees, deleteSaree } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSaree, setSelectedSaree] = useState<Saree | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');

  const filteredSarees = sarees.filter(saree => {
    const matchesSearch = saree.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || saree.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWhatsAppShare = (saree: typeof sarees[0]) => {
    const message = `🥻 *${saree.name}*\n\n💰 Price: ₹${saree.price.toLocaleString()}\n📦 Stock: ${saree.stock} pieces\n📝 ${saree.description}\n\n*Ama Sarees* - Elegant Textiles at Home`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  const handleDelete = async (saree: Saree) => {
    if (confirm(`Are you sure you want to delete "${saree.name}"?`)) {
      try {
        await deleteSaree(saree.id);
        toast({
          title: "Success",
          description: `${saree.name} has been deleted.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete saree.",
          variant: "destructive"
        });
      }
    }
  };

  const handleView = (saree: Saree) => {
    setSelectedSaree(saree);
    setViewMode('detail');
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (stock <= 2) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  if (viewMode === 'detail' && selectedSaree) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setViewMode('table')}>
            ← Back to List
          </Button>
          <h1 className="font-elegant text-2xl font-bold text-primary">{selectedSaree.name}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <img 
                src={selectedSaree.image || '/placeholder.svg'} 
                alt={selectedSaree.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{selectedSaree.name}</h3>
                <Badge variant="outline">{selectedSaree.category}</Badge>
                <p className="text-muted-foreground">{selectedSaree.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-2xl font-bold text-primary">₹{selectedSaree.price.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock</label>
                  <p className="text-xl font-semibold">{selectedSaree.stock} pieces</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm">{selectedSaree.notes || 'No additional notes'}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => navigate(`/edit-saree/${selectedSaree.id}`)} className="flex-1">
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(selectedSaree)}>
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
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
            <div className="text-2xl font-bold text-primary">{sarees.length}</div>
            <p className="text-sm text-muted-foreground">Total Sarees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{sarees.filter(s => s.stock > 2).length}</div>
            <p className="text-sm text-muted-foreground">In Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{sarees.filter(s => s.stock <= 2 && s.stock > 0).length}</div>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{sarees.filter(s => s.stock === 0).length}</div>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-elegant text-3xl font-bold text-primary">Saree Catalog</h1>
          <p className="text-muted-foreground">Manage your beautiful collection</p>
        </div>
        <Button onClick={() => navigate('/add-saree')} className="gradient-warm shadow-soft">
          <Plus size={16} className="mr-2" />
          Add Saree
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sarees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Sarees ({filteredSarees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSarees.map((saree) => {
                const stockStatus = getStockStatus(saree.stock);
                return (
                  <TableRow key={saree.id}>
                    <TableCell>
                      <img 
                        src={saree.image || '/placeholder.svg'} 
                        alt={saree.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{saree.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{saree.category}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">₹{saree.price.toLocaleString()}</TableCell>
                    <TableCell>{saree.stock}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleView(saree)}>
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/edit-saree/${saree.id}`)}>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(saree)}
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
          
          {filteredSarees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sarees found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Catalog;